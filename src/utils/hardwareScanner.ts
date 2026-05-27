import { AppState, PermissionsAndroid, Platform } from 'react-native';
import UrbantixHardwareScanner from '../../modules/urbantix-hardware-scanner';
import type {
  HardwareScannerResult,
  HardwareScannerSession,
} from '../../modules/urbantix-hardware-scanner';

export async function ensureHardwareScannerNotificationPermission() {
  if (
    Platform.OS !== 'android' ||
    Platform.Version < 33 ||
    !UrbantixHardwareScanner.isAvailable ||
    !UrbantixHardwareScanner.isHardwareScannerSupported()
  ) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function isHardwareScannerSupported() {
  if (Platform.OS !== 'android' || !UrbantixHardwareScanner.isAvailable) {
    return false;
  }

  return UrbantixHardwareScanner.isHardwareScannerSupported();
}

export function canDrawHardwareScannerOverlay() {
  if (
    Platform.OS !== 'android' ||
    !UrbantixHardwareScanner.isAvailable ||
    !UrbantixHardwareScanner.isHardwareScannerSupported()
  ) {
    return false;
  }

  return UrbantixHardwareScanner.canDrawOverlays();
}

export function openHardwareScannerOverlaySettings() {
  if (
    Platform.OS !== 'android' ||
    !UrbantixHardwareScanner.isAvailable ||
    !UrbantixHardwareScanner.isHardwareScannerSupported()
  ) {
    return;
  }

  UrbantixHardwareScanner.openOverlayPermissionSettings();
}

export function setHardwareScannerAppInForeground(isForeground: boolean) {
  if (Platform.OS !== 'android' || !UrbantixHardwareScanner.isAvailable) {
    return;
  }

  UrbantixHardwareScanner.setAppInForeground(isForeground);
}

export async function configureHardwareScannerSession(
  session: HardwareScannerSession
) {
  if (!UrbantixHardwareScanner.isAvailable) {
    return false;
  }
  return UrbantixHardwareScanner.configureSession(session);
}

export function startHardwareScannerService() {
  if (
    !UrbantixHardwareScanner.isAvailable ||
    !UrbantixHardwareScanner.isHardwareScannerSupported()
  ) {
    return;
  }
  UrbantixHardwareScanner.startScannerService();
}

export function stopHardwareScannerService() {
  if (
    !UrbantixHardwareScanner.isAvailable ||
    !UrbantixHardwareScanner.isHardwareScannerSupported()
  ) {
    return;
  }
  UrbantixHardwareScanner.stopScannerService();
}

export function addHardwareScannerListener(
  listener: (result: HardwareScannerResult) => void
) {
  if (!UrbantixHardwareScanner.isAvailable) {
    return {
      remove() {},
    };
  }

  return UrbantixHardwareScanner.addScanResultListener((result) => {
    listener(result);
    UrbantixHardwareScanner.clearPendingScanResult();
  });
}

export async function consumePendingHardwareScannerResult(
  listener: (result: HardwareScannerResult) => void
) {
  if (!UrbantixHardwareScanner.isAvailable) {
    return;
  }

  const pendingResult = await UrbantixHardwareScanner.getPendingScanResult();
  if (pendingResult) {
    listener(pendingResult);
    await UrbantixHardwareScanner.clearPendingScanResult();
  }
}

export function addHardwareScannerAppStateListener(
  listener: (result: HardwareScannerResult) => void
) {
  return AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      consumePendingHardwareScannerResult(listener);
    }
  });
}
