import React, {useEffect, useState} from 'react';
import QRCodeScanner from '../components/QRCodeScanner';
import {SafeAreaView, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native';
import {eventCheckin} from '../constants/services';

const QRScanner = () => {
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
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [resetSuccess]);

  const barCodeCheckIn = async () => {
    const params = {
      barcode: scannedData,
    };
    const result = await eventCheckin(params);
    if (result.success) {
      setSuccessMessage(result.message);
      setVerifiedSuccessfully(true);
    } else {
      setFailedData(result.message);
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
        }}>
        <Text style={{fontSize: 18, color: '#FFF'}}>Scan Again</Text>
      </TouchableOpacity>
    </SafeAreaView>
  ) : (
    <QRCodeScanner
      onRead={(data: {data: any}) => {
        setScanneddata(data.data);
        if (data) {
          barCodeCheckIn();
        }
      }}
      flashMode={'off'}
      reactivate={true}
      // reactivateTimeout={500}
      showMarker
      topContent={<Text style={styles.centerText}>{scannedData}</Text>}
      bottomContent={
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
      }
      bottomViewStyle={{
        backgroundColor: '#3E8B2B',
      }}
      markerStyle={{
        borderColor: '#3E8B2B',
        borderRadius: 7,
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
    color: '#3E8B2B',
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
