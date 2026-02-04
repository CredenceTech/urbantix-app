import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  Vibration,
  Animated,
  Easing,
  View,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Camera,
  type CodeType,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

type FlashMode = 'off' | 'on' | 'auto' | 'torch';

const SUPPORTED_CODE_TYPES: CodeType[] = [
  'qr',
  'pdf-417',
  'code-128',
  'code-39',
  'code-93',
  'codabar',
  'ean-13',
  'ean-8',
  'upc-a',
  'upc-e',
  'itf',
  'aztec',
  'data-matrix',
];

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
  pendingAuthorizationView?: React.ReactElement;
  flashMode?: FlashMode;
  codeTypes?: CodeType[];
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
  flashMode = 'off',
  codeTypes = SUPPORTED_CODE_TYPES,
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
  const [isAuthorizationChecked, setAuthorizationChecked] = useState(false);
  const [disableVibrationByUser, setDisableVibrationByUser] = useState(false);
  const scannerTimeout = useRef<NodeJS.Timeout | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const scanningRef = useRef(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(cameraType);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkCameraPermission = async () => {
      try {
        if (!hasPermission) {
          await requestPermission();
        }
      } catch (error) {
        console.error('Error requesting camera permission:', error);
      } finally {
        if (isMounted) {
          setAuthorizationChecked(true);
        }
      }
    };

    checkCameraPermission();

    return () => {
      isMounted = false;
    };
  }, [hasPermission, requestPermission]);

  const disable = () => {
    setDisableVibrationByUser(true);
  };

  const enable = () => {
    setDisableVibrationByUser(false);
  };

  const setScanningValue = (value: boolean) => {
    scanningRef.current = value;
    setScanning(value);
  };

  const setCameraValue = (value: boolean) => {
    setCameraActivated(value);
    setScanningValue(false);
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
    if (scanningRef.current || disableVibrationByUser) {
      return;
    }
    if (vibrate) {
      Vibration.vibrate();
    }
    setScanningValue(true);
    onRead(e);
    if (reactivate) {
      scannerTimeout.current = setTimeout(
        () => setScanningValue(false),
        reactivateTimeout
      );
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

  const safeCodeTypes = React.useMemo<CodeType[]>(() => {
    const requested = codeTypes?.length ? codeTypes : SUPPORTED_CODE_TYPES;
    const filtered = requested.filter((type) =>
      SUPPORTED_CODE_TYPES.includes(type)
    );
    if (__DEV__ && filtered.length !== requested.length) {
      const unsupported = requested.filter(
        (type) => !SUPPORTED_CODE_TYPES.includes(type)
      );
      console.warn(
        '[QRCodeScanner] Unsupported codeTypes removed:',
        unsupported
      );
    }
    return filtered.length ? filtered : (['qr'] as CodeType[]);
  }, [codeTypes]);

  const codeScanner = useCodeScanner({
    codeTypes: safeCodeTypes,
    onCodeScanned: (codes) => {
      const firstCode = codes[0];
      if (!firstCode?.value) {
        return;
      }
      const bounds = firstCode.frame
        ? {
          origin: { x: firstCode.frame.x, y: firstCode.frame.y },
          size: {
            width: firstCode.frame.width,
            height: firstCode.frame.height,
          },
        }
        : undefined;
      const cornerPoints = firstCode.corners?.map((point) => ({
        x: point.x,
        y: point.y,
      }));
      handleBarCodeRead({
        data: firstCode.value,
        type: firstCode.type,
        bounds,
        cornerPoints,
      });
    },
  });

  const renderCameraComponent = () => {
    if (!device) {
      return pendingAuthorizationView;
    }

    const torch = flashMode === 'torch' || flashMode === 'on' ? 'on' : 'off';

    return (
      <View style={[styles.camera, cameraStyle]}>
        <Camera
          style={StyleSheet.absoluteFill}
          {...cameraProps}
          device={device}
          isActive={isCameraActivated && hasPermission}
          codeScanner={codeScanner}
          torch={torch}
        />
        {renderCameraMarker()}
      </View>
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

    if (!hasPermission) {
      return isAuthorizationChecked
        ? notAuthorizedView
        : pendingAuthorizationView;
    }

    if (!device) {
      return pendingAuthorizationView;
    }

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
