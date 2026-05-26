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
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {
  useBarcodeScannerOutput,
  type Barcode,
  type TargetBarcodeFormat,
} from 'react-native-vision-camera-barcode-scanner';

type FlashMode = 'off' | 'on' | 'auto' | 'torch';
type ScannerCodeType =
  | 'qr'
  | 'pdf-417'
  | 'code-128'
  | 'code-39'
  | 'code-93'
  | 'codabar'
  | 'ean-13'
  | 'ean-8'
  | 'upc-a'
  | 'upc-e'
  | 'itf'
  | 'aztec'
  | 'data-matrix';

const SUPPORTED_CODE_TYPES: ScannerCodeType[] = [
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

const BARCODE_FORMAT_MAP: Record<ScannerCodeType, TargetBarcodeFormat> = {
  qr: 'qr-code',
  'pdf-417': 'pdf-417',
  'code-128': 'code-128',
  'code-39': 'code-39',
  'code-93': 'code-93',
  codabar: 'codabar',
  'ean-13': 'ean-13',
  'ean-8': 'ean-8',
  'upc-a': 'upc-a',
  'upc-e': 'upc-e',
  itf: 'itf',
  aztec: 'aztec',
  'data-matrix': 'data-matrix',
};

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
  codeTypes?: ScannerCodeType[];
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
  const [isCameraActivated, setCameraActivated] = useState(true);
  const fadeInOpacity = useRef(new Animated.Value(0)).current;
  const [isAuthorizationChecked, setAuthorizationChecked] = useState(false);
  const [disableVibrationByUser, setDisableVibrationByUser] = useState(false);
  const scannerTimeout = useRef<NodeJS.Timeout | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const scanningRef = useRef(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(cameraType);
  const flattenedCameraStyle = StyleSheet.flatten(cameraStyle) || {};

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

  const setScanningValue = (value: boolean) => {
    scanningRef.current = value;
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

  useEffect(() => {
    return () => {
      if (scannerTimeout.current) {
        clearTimeout(scannerTimeout.current);
      }
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

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

  const targetBarcodeFormats = React.useMemo<TargetBarcodeFormat[]>(() => {
    const requested = Array.isArray(codeTypes) && codeTypes.length
      ? codeTypes
      : SUPPORTED_CODE_TYPES;
    const filtered = requested.filter((type) =>
      SUPPORTED_CODE_TYPES.includes(type as ScannerCodeType)
    );
    if (__DEV__ && filtered.length !== requested.length) {
      const unsupported = requested.filter(
        (type) => !SUPPORTED_CODE_TYPES.includes(type as ScannerCodeType)
      );
      console.warn(
        '[QRCodeScanner] Unsupported codeTypes removed:',
        unsupported
      );
    }
    const supportedFormats = filtered.map((type) => BARCODE_FORMAT_MAP[type]);
    return supportedFormats.length ? supportedFormats : ['qr-code'];
  }, [codeTypes]);

  const barcodeOutput = useBarcodeScannerOutput({
    barcodeFormats: targetBarcodeFormats,
    onBarcodeScanned: (barcodes: Barcode[]) => {
      const firstBarcode = barcodes[0];
      const value = firstBarcode?.rawValue ?? firstBarcode?.displayValue;

      if (!value) {
        return;
      }

      const bounds = firstBarcode.boundingBox
        ? {
          origin: {
            x: firstBarcode.boundingBox.left,
            y: firstBarcode.boundingBox.top,
          },
          size: {
            width: firstBarcode.boundingBox.right - firstBarcode.boundingBox.left,
            height: firstBarcode.boundingBox.bottom - firstBarcode.boundingBox.top,
          },
        }
        : undefined;
      const cornerPoints = firstBarcode.cornerPoints?.map((point) => ({
        x: point.x,
        y: point.y,
      }));

      handleBarCodeRead({
        data: value,
        type: firstBarcode.format,
        bounds,
        cornerPoints,
      });
    },
    onError: () => {},
  });

  const renderCameraComponent = () => {
    if (!device) {
      return pendingAuthorizationView;
    }

    const torch = flashMode === 'torch' || flashMode === 'on' ? 'on' : 'off';

    return (
      <View style={[styles.camera, flattenedCameraStyle]}>
        <Camera
          style={StyleSheet.absoluteFill}
          {...cameraProps}
          device={device}
          isActive={isCameraActivated && hasPermission}
          outputs={[barcodeOutput]}
          torchMode={torch}
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
            width: flattenedCameraStyle.width || '100%',
            height:
              flattenedCameraStyle.height || styles.camera.height,
            alignSelf: 'stretch',
            overflow: 'hidden',
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
      <View style={[styles.cameraContainer, cameraContainerStyle]}>
        {renderCamera()}
      </View>
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
    minHeight: 110,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  cameraContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  camera: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width: '100%',
    height: 300,
    overflow: 'hidden',
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
