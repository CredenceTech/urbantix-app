import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {getEvent} from '../constants/services';
import {
  background_color,
  primary_color,
  white_color,
} from '../constants/custome_colors';

export const SEASON_TICKET_EVENT_REQUIRED_MESSAGE =
  'event_id is required for season ticket check-in';

export const needsSeasonTicketEvent = (message?: string | null) =>
  message === SEASON_TICKET_EVENT_REQUIRED_MESSAGE;

type EventItem = {
  id: number | string;
  name: string;
  place?: string;
  start_date?: string;
};

type Props = {
  visible: boolean;
  userId?: number | string;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (event: EventItem) => void;
};

const SeasonTicketEventModal = ({
  visible,
  userId,
  submitting = false,
  onCancel,
  onSubmit,
}: Props) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const requestId = useRef(0);

  const PAGE_SIZE = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!visible) {
      requestId.current += 1;
      setSelectedEvent(null);
      setError('');
      setSearch('');
      setDebouncedSearch('');
      setEvents([]);
      setPage(1);
      setTotalEvents(0);
      return;
    }

    let active = true;
    const currentRequest = ++requestId.current;
    const loadEvents = async () => {
      setLoading(true);
      setError('');
      setSelectedEvent(null);
      const result = await getEvent({
        keyword: debouncedSearch,
        pageNumber: 1,
        pageSize: PAGE_SIZE,
        isLogin: true,
        isLike: false,
        userId,
        status: 'Upcoming',
      });

      if (!active || currentRequest !== requestId.current) return;
      if (result?.success) {
        setEvents(result?.data?.events || []);
        setTotalEvents(Number(result?.data?.count || 0));
        setPage(1);
      } else {
        setEvents([]);
        setTotalEvents(0);
        setError(result?.message || 'Unable to load events.');
      }
      setLoading(false);
    };

    loadEvents();
    return () => {
      active = false;
    };
  }, [visible, userId, debouncedSearch]);

  const loadNextPage = async () => {
    if (loading || loadingNextPage || events.length >= totalEvents) return;

    const nextPage = page + 1;
    const currentRequest = requestId.current;
    setLoadingNextPage(true);
    const result = await getEvent({
      keyword: debouncedSearch,
      pageNumber: nextPage,
      pageSize: PAGE_SIZE,
      isLogin: true,
      isLike: false,
      userId,
      status: 'Upcoming',
    });

    if (currentRequest !== requestId.current) {
      setLoadingNextPage(false);
      return;
    }

    if (result?.success) {
      const nextEvents: EventItem[] = result?.data?.events || [];
      setEvents(current => [
        ...current,
        ...nextEvents.filter(item => !current.some(existing => existing.id === item.id)),
      ]);
      setTotalEvents(Number(result?.data?.count || totalEvents));
      setPage(nextPage);
    } else {
      setError(result?.message || 'Unable to load more events.');
    }
    setLoadingNextPage(false);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
        <View style={styles.card}>
          <Text style={styles.title}>Select event</Text>
          <Text style={styles.message}>
            Select the event for this season ticket check-in.
          </Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search events"
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            autoCorrect={false}
          />

          {loading ? (
            <ActivityIndicator style={styles.loader} color={primary_color} />
          ) : (
            <FlatList
              data={events}
              keyExtractor={item => String(item.id)}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              onEndReached={loadNextPage}
              onEndReachedThreshold={0.35}
              ListFooterComponent={
                loadingNextPage ? (
                  <ActivityIndicator style={styles.footerLoader} color={primary_color} />
                ) : null
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>{error || 'No live events found.'}</Text>
              }
              renderItem={({item}) => {
                const selected = selectedEvent?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.eventRow, selected && styles.selectedEventRow]}
                    onPress={() => setSelectedEvent(item)}>
                    <Text style={styles.eventName} numberOfLines={1}>{item.name}</Text>
                    {!!item.place && <Text style={styles.eventPlace} numberOfLines={1}>{item.place}</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={submitting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, (!selectedEvent || submitting) && styles.disabledButton]}
              disabled={!selectedEvent || submitting}
              onPress={() => selectedEvent && onSubmit(selectedEvent)}>
              {submitting ? (
                <ActivityIndicator color={white_color} />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 24},
  card: {maxHeight: '85%', backgroundColor: background_color, borderRadius: 18, borderWidth: 2, borderColor: primary_color, padding: 16},
  title: {color: white_color, fontSize: 20, fontWeight: '700', textAlign: 'center'},
  message: {color: '#E5E7EB', fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 5, marginBottom: 10},
  searchInput: {height: 40, borderWidth: 1, borderColor: '#59616C', borderRadius: 10, color: white_color, backgroundColor: '#20262D', paddingHorizontal: 12, marginBottom: 10},
  loader: {marginVertical: 24},
  footerLoader: {paddingVertical: 10},
  list: {maxHeight: 280},
  eventRow: {borderWidth: 1, borderColor: '#59616C', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 8, marginBottom: 6},
  selectedEventRow: {borderColor: primary_color, backgroundColor: 'rgba(62,139,43,0.25)'},
  eventName: {color: white_color, fontSize: 14, fontWeight: '600'},
  eventPlace: {color: '#C7CDD4', fontSize: 12, marginTop: 2},
  emptyText: {color: '#E5E7EB', textAlign: 'center', paddingVertical: 22},
  actions: {flexDirection: 'row', gap: 10, marginTop: 12},
  cancelButton: {flex: 1, borderWidth: 1, borderColor: white_color, borderRadius: 999, paddingVertical: 10, alignItems: 'center'},
  submitButton: {flex: 1, backgroundColor: primary_color, borderRadius: 999, paddingVertical: 10, alignItems: 'center'},
  disabledButton: {opacity: 0.45},
  cancelText: {color: white_color, fontWeight: '700'},
  submitText: {color: white_color, fontWeight: '700'},
});

export default SeasonTicketEventModal;
