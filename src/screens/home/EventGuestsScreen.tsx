import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    Image,
    StatusBar,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TextInput,
} from "react-native";
import { LegendList } from "@legendapp/list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from '@react-navigation/native';
import { background_color, gray_color, primary_color, white_color, black_color } from "../../constants/custome_colors";
import { custome_screenContainer } from "../../constants/custome_styles";

import NavigationBar from "../../components/NavigationBar";
import EventGuestComponent from "../../components/EventGuestComponent";
import Loader from "../../components/Loader";
import { event_checkedin_list } from "../../constants/api_constants";
import { api } from "../../constants/api_manager";
import { useDispatch } from "react-redux";
import { removeUser } from "../../state/slices/authenticationSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import debounce from 'lodash.debounce';
import { ActivityIndicator } from 'react-native';

interface GuestItem {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    cell_phone: string;
}

interface FooterProps {
    isLoadingNextPage: boolean;
}

const FooterComponent: React.FC<FooterProps> = ({ isLoadingNextPage }) => {
    if (!isLoadingNextPage) {
        return null;
    }

    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={primary_color} />
        </View>
    );
};

const PAGE_SIZE = 10;

const EventGuestsScreen: React.FC = () => {
    const dispatch = useDispatch();
    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    // Navigation params
    const objEvent = route.params?.objEvent;

    // Screen state
    const [isLoading, setLoading] = useState(false);
    const [isLoadingNextPage, setLoadingNextPage] = useState(false);
    const [isSearchLoading, setSearchLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [arrayEventGuests, setArrayEventGuests] = useState<GuestItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentpage, setCurrentpage] = useState(1);

    // Memoize debounce handler to prevent recreation on every render
    const debouncedSearchHandler = useMemo(
        () => debounce((value: string) => {
            setDebouncedSearch(value);
        }, 500),
        []
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedSearchHandler.cancel();
        };
    }, [debouncedSearchHandler]);

    // Trigger debounced search when search changes
    useEffect(() => {
        debouncedSearchHandler(search);
    }, [search, debouncedSearchHandler]);

    // Fetch when page changes
    useEffect(() => {
        getEventGuests();
    }, [currentpage]);

    // Reset and fetch when debounced search changes
    useEffect(() => {
        if (currentpage === 1) {
            getEventGuests(true); // Pass true to indicate it's a search
        } else {
            setCurrentpage(1);
        }
    }, [debouncedSearch]);

    const searchValueChanged = (text: string) => {
        setSearch(text);
    };

    const nextPage = useCallback(() => {
        if (isLoading || isLoadingNextPage) return;
        // Check if there are more pages based on the total count from API
        const hasMorePages = totalCount > currentpage * PAGE_SIZE;
        if (hasMorePages) {
            setCurrentpage(prev => prev + 1);
        }
    }, [isLoading, isLoadingNextPage, totalCount, currentpage]);

    const getEventGuests = async (isSearch: boolean = false) => {
        // Determine if this is initial load, pagination, or search
        const isInitialLoad = currentpage === 1 && !isSearch;
        const isPagination = currentpage > 1;

        if (isInitialLoad) {
            setLoading(true);
        } else if (isPagination) {
            setLoadingNextPage(true);
        } else if (isSearch) {
            setSearchLoading(true);
        }

        try {
            const apiEndpoint = `${event_checkedin_list}/${objEvent.id}/transactions?keyword=${debouncedSearch}&pageNumber=${currentpage}&pageSize=${PAGE_SIZE}`;
            const response = await api.get(apiEndpoint);

            console.log(JSON.stringify(response.data, null, 2), "Response Data")

            const responseData = response.data;
            const success = responseData.success;
            const message = responseData.message;
            const data = responseData.data;
            const count = responseData.count ?? responseData.total ?? (data ? (Array.isArray(data) ? data.length : (data.count || data.total || 0)) : 0);
            const currentPage = responseData.currentPage ?? currentpage;
            const perPage = responseData.perPage ?? PAGE_SIZE;

            // Process data if it exists, regardless of success flag
            if (data !== null && data !== undefined) {
                // Handle response - data could be array directly or have nested structure
                const guests = Array.isArray(data) ? data : (data.items || data.guests || data.transactions || []);

                if (currentpage === 1) {
                    setArrayEventGuests(guests);
                    setTotalCount(count);
                } else {
                    // Filter out duplicates when appending
                    const newGuests = guests.filter((newGuest: GuestItem) =>
                        !arrayEventGuests.some(existing => existing.id === newGuest.id)
                    );
                    if (newGuests.length > 0) {
                        setArrayEventGuests(prev => [...prev, ...newGuests]);
                    }
                }
            } else if (!success) {
                // Only show failure if no data and success is false
                Alert.alert("Failed", message || "No data returned");
            }
        } catch (err: any) {
            if (err.response) {
                // Server responded with error status
                Alert.alert("Error", err.response.data.message || "Failed to fetch guests");
            } else if (err.request) {
                // Request was made but no response received
                Alert.alert("Error", "Network error - please check your connection");
            } else {
                // Something else happened
                Alert.alert("Error", "Failed to fetch guests");
            }
        } finally {
            if (isInitialLoad) {
                setLoading(false);
            } else if (isPagination) {
                setLoadingNextPage(false);
            } else if (isSearch) {
                setSearchLoading(false);
            }
        }
    };

    const backClicked = () => {
        navigation.goBack();
    };

    const logOutClicked = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'OK',
                onPress: () => userLogout(),
                style: 'default',
            },
        ]);
    };

    const userLogout = async () => {
        navigation.navigate('OnBoardingScreen');
        await AsyncStorage.removeItem('alreadylaunch');
        dispatch(removeUser());
    };

    return (
        <View style={custome_screenContainer.view_container}>
            <Loader isLoading={isLoading} />
            <View style={{ backgroundColor: primary_color, height: safeAreaInsets.top }}>
                <StatusBar backgroundColor='#3e8b2b' barStyle="light-content" />
            </View>
            <SafeAreaView style={styles.SafeAreaView}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}>
                    <NavigationBar isShowBack={true} backClicked={backClicked} isShowTitle={true} screenTitle={'Guest List'} isShowLogout={false} logOutClicked={logOutClicked} />
                    <View style={styles.mainView}>
                        <View style={{ flexDirection: "row", backgroundColor: white_color, paddingHorizontal: 10, paddingVertical: 5, height: 50 }}>
                            <Image
                                source={require("../../assets/images/search.png")}
                                style={styles.search_image}
                            />
                            <TextInput
                                style={{ fontSize: 14, fontWeight: "normal", color: black_color, flex: 1 }}
                                placeholder="Search"
                                placeholderTextColor='#808080'
                                onChangeText={(text) =>
                                    searchValueChanged(text)
                                }
                                value={search} />
                            {isSearchLoading && (
                                <ActivityIndicator
                                    size="small"
                                    color={primary_color}
                                    style={{ alignSelf: 'center', marginLeft: 10 }}
                                />
                            )}
                        </View>
                        {arrayEventGuests.length > 0 ? (
                            <LegendList
                                data={arrayEventGuests}
                                renderItem={({ item }: { item: GuestItem }) => (
                                    <EventGuestComponent objEventGuest={item} />
                                )}
                                keyExtractor={(item: GuestItem) => item.id}
                                showsVerticalScrollIndicator={false}
                                onEndReached={({ distanceFromEnd }) => {
                                    if (distanceFromEnd < 0) return;
                                    nextPage();
                                }}
                                onEndReachedThreshold={0.5}
                                estimatedItemSize={80}
                                ListFooterComponent={() => <FooterComponent isLoadingNextPage={isLoadingNextPage} />}
                            />
                        ) : (
                            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                <Text style={styles.notDataLable}>No Guests Found!</Text>
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    SafeAreaView: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: background_color
    },
    mainView: {
        flex: 1,
        // alignItems: 'center',
        backgroundColor: background_color
    },
    notDataLable: {
        fontSize: 18,
        fontWeight: '500',
        color: gray_color,
    },
    search_image: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginVertical: 10,
        marginRight: 10,
        tintColor: primary_color
    },
});

export default EventGuestsScreen;