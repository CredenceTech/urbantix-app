import React, {useEffect, useState} from 'react';
import QRCodeScanner from '../components/QRCodeScanner';
import {SafeAreaView, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native';
import {eventCheckin} from '../constants/services';
import {useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {baseURL} from '../constants/api_constants';
import type {HardwareScannerResult} from '../../modules/urbantix-hardware-scanner';
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
  const [scannedData, setScanneddata] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [failedMessage, setFailedData] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [alreadyScanned, setAlreadyScanned] = useState(false);
  const [verifiedSuccessfully, setVerifiedSuccessfully] = useState(false);

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

  const barCodeCheckIn = async (barcode: string) => {
    const params = {
      barcode,
    };
    const result = await eventCheckin(params);

    if (result?.success) {
      setSuccessMessage(result.message);
      setVerifiedSuccessfully(true);
    } else {
      setFailedData(result?.message || 'Ticket check-in failed.');
      setAlreadyScanned(true);
      setResetSuccess(true);
    }
  };

  return verifiedSuccessfully ? (
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
          barCodeCheckIn(barcode);
        }
      }}
      flashMode={'off'}
      reactivate={true}
      // reactivateTimeout={500}
      showMarker
      topContent={<Text style={styles.centerText}>{scannedData}</Text>}
      bottomContent={
        <>
          <TouchableOpacity
            style={[
              styles.buttonTouchable,
              {backgroundColor: alreadyScanned ? '#FFF' : null},
            ]}>
            <Text
              style={[
                styles.buttonText,
                {color: alreadyScanned ? '#EF4040' : '#FFF'},
              ]}>
              {failedMessage}
            </Text>
          </TouchableOpacity>
          {!objEvent && (
            <Text style={styles.helperText}>
              Please open event and scan from event page for student passes.
            </Text>
          )}
        </>
      }
      bottomViewStyle={{
        backgroundColor: '#3E8B2B',
      }}
      markerStyle={{
        borderColor: '#3E8B2B',
        borderRadius: 7,
      }}
      topViewStyle={{
        backgroundColor: '#3E8B2B',
        color: '#FFF',
      }}
    />
  );
};

export default QRScanner;

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    padding: 32,
    color: '#FFF',
  },
  helperText: {
    fontSize: 14,
    paddingHorizontal: 24,
    paddingTop: 12,
    color: '#FFF',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  buttonTouchable: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
});
