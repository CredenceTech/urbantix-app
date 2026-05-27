import {
  requireOptionalNativeModule,
  type EventSubscription,
} from 'expo-modules-core';
import type {
  HardwareScannerEvents,
  HardwareScannerResult,
  HardwareScannerSession,
} from './UrbantixHardwareScanner.types';

type NativeUrbantixHardwareScannerModule = {
  configureSession(session: HardwareScannerSession): Promise<boolean>;
  clearSession(): Promise<boolean>;
  getPendingScanResult(): Promise<HardwareScannerResult | null>;
  clearPendingScanResult(): Promise<boolean>;
  startScan(): void;
  stopScan(): void;
  startScannerService(): void;
  stopScannerService(): void;
  isHardwareScannerSupported(): boolean;
  canDrawOverlays(): boolean;
  openOverlayPermissionSettings(): void;
  setAppInForeground(isForeground: boolean): void;
  addListener<EventName extends keyof HardwareScannerEvents>(
    eventName: EventName,
    listener: HardwareScannerEvents[EventName]
  ): EventSubscription;
};

const nativeModule =
  requireOptionalNativeModule<NativeUrbantixHardwareScannerModule>(
    'UrbantixHardwareScanner'
  );

const noopSubscription: EventSubscription = {
  remove() {},
};

const UrbantixHardwareScanner = {
  isAvailable: !!nativeModule,
  configureSession(session: HardwareScannerSession) {
    return nativeModule?.configureSession(session) ?? Promise.resolve(false);
  },
  clearSession() {
    return nativeModule?.clearSession() ?? Promise.resolve(false);
  },
  getPendingScanResult() {
    return nativeModule?.getPendingScanResult() ?? Promise.resolve(null);
  },
  clearPendingScanResult() {
    return nativeModule?.clearPendingScanResult() ?? Promise.resolve(false);
  },
  startScan() {
    nativeModule?.startScan();
  },
  stopScan() {
    nativeModule?.stopScan();
  },
  startScannerService() {
    nativeModule?.startScannerService();
  },
  stopScannerService() {
    nativeModule?.stopScannerService();
  },
  isHardwareScannerSupported() {
    return nativeModule?.isHardwareScannerSupported() ?? false;
  },
  canDrawOverlays() {
    return nativeModule?.canDrawOverlays() ?? false;
  },
  openOverlayPermissionSettings() {
    nativeModule?.openOverlayPermissionSettings();
  },
  setAppInForeground(isForeground: boolean) {
    nativeModule?.setAppInForeground(isForeground);
  },
  addScanResultListener(listener: (event: HardwareScannerResult) => void) {
    if (!nativeModule) {
      return noopSubscription;
    }
    return nativeModule.addListener('onScanResult', listener);
  },
};

export default UrbantixHardwareScanner;
