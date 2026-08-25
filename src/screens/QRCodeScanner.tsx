import React, {useEffect, useState} from 'react';
import QRCodeScanner from '../components/QRCodeScanner';
import {SafeAreaView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native';
import {eventCheckin} from '../constants/services';
import {useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {baseURL} from '../constants/api_constants';
import type {HardwareScannerResult} from '../../modules/urbantix-hardware-scanner';
import SeasonTicketEventModal, {
  needsSeasonTicketEvent,
} from '../components/SeasonTicketEventModal';
import {
  addHardwareScannerAppStateListener,
  addHardwareScannerListener,
  configureHardwareScannerSession,
  consumePendingHardwareScannerResult,
  ensureHardwareScannerNotificationPermission,
} from '../utils/hardwareScanner';

const QRScanner = () => {
  const route = useRoute<any>();
  const objEvent = route.params?.objEvent;
  const hardwareResult = route.params?.hardwareResult;
  const authentication = useSelector((state: any) => state.authentication);
  const [scannedData, setScanneddata] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [failedMessage, setFailedData] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [alreadyScanned, setAlreadyScanned] = useState(false);
  const [verifiedSuccessfully, setVerifiedSuccessfully] = useState(false);
  const [pendingSeasonBarcode, setPendingSeasonBarcode] = useState<string | null>(null);
  const [submittingSeasonEvent, setSubmittingSeasonEvent] = useState(false);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout;
    if (resetSuccess) {
      timer = setTimeout(() => {
        setScanneddata(null);
        setResetSuccess(false);
        setAlreadyScanned(false);
        setFailedData(null);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [resetSuccess]);

  const handleScanResult = (result: HardwareScannerResult) => {
    setScanneddata(result.scannedCode);
    if (result.success) {
      setSuccessMessage(result.message);
      setVerifiedSuccessfully(true);
      setAlreadyScanned(false);
      setFailedData(null);
    } else {
      if (needsSeasonTicketEvent(result.message)) {
        setPendingSeasonBarcode(result.scannedCode);
        setAlreadyScanned(false);
        setFailedData(null);
        return;
      }
      setFailedData(result.message);
      setAlreadyScanned(true);
      setResetSuccess(true);
    }
  };

  useEffect(() => {
    if (hardwareResult?.scannedCode) {
      handleScanResult(hardwareResult);
    }
  }, [hardwareResult?.processedAt]);

  useEffect(() => {
    ensureHardwareScannerNotificationPermission();

    configureHardwareScannerSession({
      authToken: authentication?.user?.access_token || '',
      baseUrl: baseURL,
      mode: 'ticket',
    });

    consumePendingHardwareScannerResult(handleScanResult);

    const scanSubscription = addHardwareScannerListener(handleScanResult);
    const appStateSubscription = addHardwareScannerAppStateListener(
      handleScanResult
    );

    return () => {
      scanSubscription.remove();
      appStateSubscription.remove();
    };
  }, [authentication?.user?.access_token]);

  const barCodeCheckIn = async (barcode: string, eventId?: number | string) => {
    const params = {
      barcode,
      ...(eventId ? {event_id: eventId} : {}),
    };
    const result = await eventCheckin(params);

    if (result?.success) {
      setSuccessMessage(result.message);
      setVerifiedSuccessfully(true);
    } else {
      if (needsSeasonTicketEvent(result?.message)) {
        setPendingSeasonBarcode(barcode);
        setAlreadyScanned(false);
        setFailedData(null);
        return;
      }
      setFailedData(result?.message || 'Ticket check-in failed.');
      setAlreadyScanned(true);
      setResetSuccess(true);
    }
  };

  const submitSeasonTicketEvent = async (event: {id: number | string}) => {
    if (!pendingSeasonBarcode) return;
    setSubmittingSeasonEvent(true);
    const barcode = pendingSeasonBarcode;
    const result = await eventCheckin({barcode, event_id: event.id});
    setSubmittingSeasonEvent(false);
    setPendingSeasonBarcode(null);

    if (result?.success) {
      setSuccessMessage(result.message);
      setVerifiedSuccessfully(true);
      setAlreadyScanned(false);
      setFailedData(null);
    } else {
      setFailedData(result?.message || 'Ticket check-in failed.');
      setAlreadyScanned(true);
      setResetSuccess(true);
    }
  };

  return (
    <>
      {verifiedSuccessfully ? (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#3E8B2B',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
      <Text
        style={{fontSize: 15, justifyContent: 'center', alignItems: 'center'}}>
        {successMessage}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: '#000',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderBottomWidth: 2,
          borderColor: '#FFF',
        }}
        onPress={() => {
          setVerifiedSuccessfully(false);
          setSuccessMessage(null);
          setScanneddata(null);
        }}>
        <Text style={{fontSize: 18, color: '#FFF'}}>Scan New Ticket</Text>
      </TouchableOpacity>
    </SafeAreaView>
  ) : (
    <QRCodeScanner
      onRead={(data: {data: any}) => {
        const barcode = data?.data;
        setScanneddata(barcode);
        if (barcode) {
          barCodeCheckIn(barcode, objEvent?.id);
        }
      }}
      flashMode={'off'}
      reactivate={true}
      // reactivateTimeout={500}
      showMarker
      cameraStyle={styles.cameraFrame}
      topContent={
        <View style={styles.topContentContainer}>
          <Text numberOfLines={2} style={styles.centerText}>
            {scannedData}
          </Text>
        </View>
      }
      bottomContent={
        <View style={styles.bottomContentContainer}>
          <View style={styles.messageRow}>
            {!!failedMessage && (
              <TouchableOpacity
                style={[
                  styles.buttonTouchable,
                  {backgroundColor: alreadyScanned ? '#FFF' : 'transparent'},
                ]}>
                <Text
                  style={[
                    styles.buttonText,
                    {color: alreadyScanned ? '#EF4040' : '#FFF'},
                  ]}>
                  {failedMessage}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {!objEvent && (
            <View style={styles.helperTextContainer}>
              <Text style={styles.helperText}>
                Please open event and scan from event page for student passes.
              </Text>
            </View>
          )}
        </View>
      }
      cameraContainerStyle={styles.cameraSection}
      bottomViewStyle={{
        backgroundColor: '#3E8B2B',
        minHeight: 145,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
      }}
      markerStyle={{
        borderColor: '#3E8B2B',
        borderRadius: 7,
      }}
      topViewStyle={{
        backgroundColor: '#3E8B2B',
        color: '#FFF',
        minHeight: 96,
      }}
    />
      )}
      <SeasonTicketEventModal
        visible={!!pendingSeasonBarcode}
        userId={authentication?.user?.id}
        submitting={submittingSeasonEvent}
        onCancel={() => setPendingSeasonBarcode(null)}
        onSubmit={submitSeasonTicketEvent}
      />
    </>
  );
};

export default QRScanner;

const styles = StyleSheet.create({
  topContentContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 56,
  },
  centerText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFF',
    textAlign: 'center',
    width: '100%',
  },
  cameraSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cameraFrame: {
    width: '100%',
    height: '100%',
  },
  bottomContentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    minHeight: 98,
  },
  messageRow: {
    minHeight: 36,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  helperTextContainer: {
    width: '100%',
    minHeight: 24,
    justifyContent: 'flex-end',
  },
  helperText: {
    fontSize: 13,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonText: {
    fontSize: 14,
    textAlign: 'center',
  },
  buttonTouchable: {
    maxWidth: '76%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
