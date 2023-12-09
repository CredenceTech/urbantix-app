import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  Vibration,
  Animated,
  Easing,
  View,
  Text,
  Platform,
  TouchableWithoutFeedback,
  PermissionsAndroid,
} from 'react-native';
import { RNCamera as Camera } from 'react-native-camera';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';

type QRCodeScannerProps = {
  onRead: (data: any) => void;
  vibrate?: boolean;
  reactivate?: boolean;
  reactivateTimeout?: number;
  cameraTimeout?: number;
  fadeIn?: boolean;
  showMarker?: boolean;
  cameraType?: 'front' | 'back';
  customMarker?: React.ReactElement;
  containerStyle?: any;
  cameraStyle?: any;
  cameraContainerStyle?: any;
  markerStyle?: any;
  topViewStyle?: any;
  bottomViewStyle?: any;
  topContent?: React.ReactElement | string;
  bottomContent?: React.ReactElement | string;
  notAuthorizedView?: React.ReactElement;
  permissionDialogTitle?: string;
  permissionDialogMessage?: string;
  buttonPositive?: string;
  checkAndroid6Permissions?: boolean;
  flashMode?: string;
  cameraProps?: Record<string, any>;
  cameraTimeoutView?: React.ReactElement;
};

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onRead = () => null,
  vibrate = true,
  reactivate = false,
  reactivateTimeout = 0,
  cameraTimeout = 0,
  fadeIn = true,
  showMarker = false,
  cameraType = 'back',
  notAuthorizedView = (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          textAlign: 'center',
          fontSize: 16,
        }}
      >
        Camera not authorized
      </Text>
    </View>
  ),
  pendingAuthorizationView = (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          textAlign: 'center',
          fontSize: 16,
        }}
      >
        ...
      </Text>
    </View>
  ),
  permissionDialogTitle = 'Info',
  permissionDialogMessage = 'Need camera permission',
  buttonPositive = 'OK',
  checkAndroid6Permissions = false,
  flashMode = CAMERA_FLASH_MODE.auto,
  cameraProps = {},
  cameraTimeoutView = (
    <View
      style={{
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        backgroundColor: 'black',
      }}
    >
      <Text style={{ color: 'white' }}>Tap to activate camera</Text>
    </View>
  ),
  customMarker,
  containerStyle,
  markerStyle,
  topContent,
  bottomContent,
  cameraStyle,
  topViewStyle,
  cameraContainerStyle,
  bottomViewStyle,
}) => {
  const [scanning, setScanning] = useState(false);
  const [isCameraActivated, setCameraActivated] = useState(true);
  const fadeInOpacity = useRef(new Animated.Value(0)).current;
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthorizationChecked, setAuthorizationChecked] = useState(false);
  const [disableVibrationByUser, setDisableVibrationByUser] = useState(false);
  const scannerTimeout = useRef<NodeJS.Timeout | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkCameraPermission = async () => {
      if (Platform.OS === 'ios') {
        const cameraStatus = await request(PERMISSIONS.IOS.CAMERA);
        setIsAuthorized(cameraStatus === RESULTS.GRANTED);
        setAuthorizationChecked(true);
      } else if (
        Platform.OS === 'android' &&
        checkAndroid6Permissions
      ) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: permissionDialogTitle,
            message: permissionDialogMessage,
            buttonPositive,
          }
        );
        const isAuthorized = granted === PermissionsAndroid.RESULTS.GRANTED;
        setIsAuthorized(isAuthorized);
        setAuthorizationChecked(true);
      } else {
        setIsAuthorized(true);
        setAuthorizationChecked(true);
      }
    };

    if (fadeIn) {
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(fadeInOpacity, {
          toValue: 1,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }

    checkCameraPermission();
  }, []);

  const disable = () => {
    setDisableVibrationByUser(true);
  };

  const enable = () => {
    setDisableVibrationByUser(false);
  };

  const setScanningValue = (value: boolean) => {
    setScanning(value);
  };

  const setCameraValue = (value: boolean) => {
    setCameraActivated(value);
    setScanning(false);
    fadeInOpacity.setValue(0);
    if (value && fadeIn) {
      Animated.sequence([
        Animated.delay(10),
        Animated.timing(fadeInOpacity, {
          toValue: 1,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleBarCodeRead = (e: any) => {
    if (!scanning && !disableVibrationByUser) {
      if (vibrate) {
        Vibration.vibrate();
      }
      setScanning(true);
      onRead(e);
      if (reactivate) {
        scannerTimeout.current = setTimeout(
          () => setScanning(false),
          reactivateTimeout
        );
      }
    }
  };

  const renderTopContent = () => {
    if (topContent) {
      return topContent;
    }
    return null;
  };

  const renderBottomContent = () => {
    if (bottomContent) {
      return bottomContent;
    }
    return null;
  };

  const renderCameraMarker = () => {
    if (showMarker) {
      if (customMarker) {
        return customMarker;
      } else {
        return (
          <View style={styles.rectangleContainer}>
            <View
              style={[
                styles.rectangle,
                markerStyle ? markerStyle : null,
              ]}
            />
          </View>
        );
      }
    }
    return null;
  };

  const renderCameraComponent = () => {
    return (
      <Camera
        androidCameraPermissionOptions={{
          title: permissionDialogTitle,
          message: permissionDialogMessage,
          buttonPositive,
        }}
        style={[styles.camera, cameraStyle]}
        onBarCodeRead={handleBarCodeRead}
        type={cameraType}
        flashMode={flashMode}
        captureAudio={false}
        {...cameraProps}
      >
        {renderCameraMarker()}
      </Camera>
    );
  };

  const renderCamera = () => {
    if (!isCameraActivated) {
      return (
        <TouchableWithoutFeedback onPress={() => setCameraValue(true)}>
          {cameraTimeoutView}
        </TouchableWithoutFeedback>
      );
    }

    if (isAuthorized) {
      if (cameraTimeout > 0) {
        timer.current && clearTimeout(timer.current);
        timer.current = setTimeout(
          () => setCameraValue(false),
          cameraTimeout
        );
      }

      if (fadeIn) {
        return (
          <Animated.View
            style={{
              opacity: fadeInOpacity,
              backgroundColor: 'transparent',
              height:
                (cameraStyle && cameraStyle.height) || styles.camera.height,
            }}
          >
            {renderCameraComponent()}
          </Animated.View>
        );
      }
      return renderCameraComponent();
    } else if (!isAuthorizationChecked) {
      return pendingAuthorizationView;
    } else {
      return notAuthorizedView;
    }
  };

  return (
    <View style={[styles.mainContainer, containerStyle]}>
      <View style={[styles.infoView, topViewStyle]}>
        {renderTopContent()}
      </View>
      <View style={cameraContainerStyle}>{renderCamera()}</View>
      <View style={[styles.infoView, bottomViewStyle]}>
        {renderBottomContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  infoView: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width,
  },

  camera: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: Dimensions.get('window').width,
    width: Dimensions.get('window').width,
  },

  rectangleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  rectangle: {
    height: 250,
    width: 250,
    borderWidth: 2,
    borderColor: '#00FF00',
    backgroundColor: 'transparent',
  },
});

export default QRCodeScanner;
