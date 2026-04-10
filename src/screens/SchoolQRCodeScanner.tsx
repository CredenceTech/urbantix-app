import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import QRCodeScanner from '../components/QRCodeScanner';
import NavigationBar from '../components/NavigationBar';
import { primary_color, white_color } from '../constants/custome_colors';
import { studentPassCheckin } from '../constants/services';

const SchoolQRCodeScanner = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const safeAreaInsets = useSafeAreaInsets();
  const authentication = useSelector((state: any) => state.authentication);

  const objEvent = route.params?.objEvent;
  const eventId = objEvent?.id;
  const userId = authentication?.user?.id;

  const [scannedData, setScannedData] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [resetFailure, setResetFailure] = useState(false);
  const [alreadyScanned, setAlreadyScanned] = useState(false);
  const [verifiedSuccessfully, setVerifiedSuccessfully] = useState(false);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout;
    if (resetFailure) {
      timer = setTimeout(() => {
        setScannedData(null);
        setResetFailure(false);
        setAlreadyScanned(false);
        setFailedMessage(null);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [resetFailure]);

  const backClicked = () => {
    navigation.goBack();
  };

  const handleStudentPassCheckin = async (passCode: string) => {
    if (!eventId || !userId) {
      setFailedMessage('Missing event or user information.');
      setAlreadyScanned(true);
      setResetFailure(true);
      return;
    }

    const params = {
      pass_code: passCode,
      event_id: eventId,
      user_id: userId,
    };

    const result = await studentPassCheckin(params);

    if (result?.success) {
      setSuccessMessage(result.message);
      setVerifiedSuccessfully(true);
      return;
    }

    setFailedMessage(result?.message || 'Student pass check-in failed.');
    setAlreadyScanned(true);
    setResetFailure(true);
  };

  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: primary_color, height: safeAreaInsets.top }} />
      <SafeAreaView style={styles.safeArea}>
        <NavigationBar
          isShowBack={true}
          backClicked={backClicked}
          isShowTitle={true}
          screenTitle={'Student Scan'}
          isShowLogout={false}
          logOutClicked={() => {}}
        />
        {verifiedSuccessfully ? (
          <SafeAreaView style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={() => {
                setVerifiedSuccessfully(false);
                setSuccessMessage(null);
                setScannedData(null);
              }}>
              <Text style={styles.scanAgainText}>Scan New Pass</Text>
            </TouchableOpacity>
          </SafeAreaView>
        ) : (
          <QRCodeScanner
            onRead={(data: { data: string }) => {
              const passCode = data?.data;
              setScannedData(passCode);
              if (passCode) {
                handleStudentPassCheckin(passCode);
              }
            }}
            flashMode={'off'}
            reactivate={true}
            showMarker
            topContent={
              <View>
                <Text style={styles.centerText}>Student Pass Scanner</Text>
                <Text style={styles.subText}>{scannedData}</Text>
              </View>
            }
            bottomContent={
              <TouchableOpacity
                style={[
                  styles.buttonTouchable,
                  { backgroundColor: alreadyScanned ? '#FFF' : 'transparent' },
                ]}>
                <Text
                  style={[
                    styles.buttonText,
                    { color: alreadyScanned ? '#EF4040' : white_color },
                  ]}>
                  {failedMessage || 'Scan student QR code'}
                </Text>
              </TouchableOpacity>
            }
            bottomViewStyle={{
              backgroundColor: primary_color,
            }}
            markerStyle={{
              borderColor: primary_color,
              borderRadius: 7,
            }}
            topViewStyle={{
              backgroundColor: primary_color,
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primary_color,
  },
  safeArea: {
    flex: 1,
    backgroundColor: primary_color,
  },
  successContainer: {
    flex: 1,
    backgroundColor: primary_color,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successText: {
    fontSize: 16,
    color: white_color,
    textAlign: 'center',
  },
  scanAgainButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderColor: '#FFF',
  },
  scanAgainText: {
    fontSize: 18,
    color: '#FFF',
  },
  centerText: {
    fontSize: 18,
    fontWeight: '500',
    paddingTop: 24,
    paddingHorizontal: 24,
    color: '#FFF',
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    paddingHorizontal: 24,
    paddingBottom: 12,
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

export default SchoolQRCodeScanner;
