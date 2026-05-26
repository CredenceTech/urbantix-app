import React, { useEffect, useState } from 'react';
import { AppState, Keyboard, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { navigationRef } from '../constants/root_navigation';
import { baseURL } from '../constants/api_constants';
import type { HardwareScannerResult } from '../../modules/urbantix-hardware-scanner';
import ScanResultModal from './ScanResultModal';
import {
  addHardwareScannerAppStateListener,
  addHardwareScannerListener,
  canDrawHardwareScannerOverlay,
  configureHardwareScannerSession,
  consumePendingHardwareScannerResult,
  ensureHardwareScannerNotificationPermission,
  openHardwareScannerOverlaySettings,
  setHardwareScannerAppInForeground,
  startHardwareScannerService,
  stopHardwareScannerService,
} from '../utils/hardwareScanner';

const SCANNER_ROUTES = new Set(['CheckIn']);
const RESULT_MODAL_DURATION = 1800;
const OVERLAY_PROMPT_MESSAGE =
  'Allow display over other apps so scan success and error messages can appear as a centered card when the app is in background or closed.';

const HardwareScannerBootstrap = () => {
  const authentication = useSelector((state: any) => state.authentication);
  const [modalResult, setModalResult] = useState<HardwareScannerResult | null>(null);
  const [showOverlayPermissionPrompt, setShowOverlayPermissionPrompt] = useState(false);

  useEffect(() => {
    if (authentication?.user?.access_token) {
      return;
    }

    setHardwareScannerAppInForeground(false);
    stopHardwareScannerService();
  }, [authentication?.user?.access_token]);

  useEffect(() => {
    if (!authentication?.user?.access_token) {
      return;
    }

    ensureHardwareScannerNotificationPermission();

    const promptForOverlayPermission = () => {
      if (canDrawHardwareScannerOverlay()) {
        setShowOverlayPermissionPrompt(false);
        return;
      }

      setShowOverlayPermissionPrompt(true);
    };

    promptForOverlayPermission();

    configureHardwareScannerSession({
      authToken: authentication.user.access_token,
      baseUrl: baseURL,
      mode: 'ticket',
    });
    setHardwareScannerAppInForeground(true);
    startHardwareScannerService();

    const handleGlobalScanResult = (result: HardwareScannerResult) => {
      try {
        Keyboard.dismiss();
        const focusedInput = TextInput.State.currentlyFocusedInput?.();
        if (focusedInput) {
          TextInput.State.blurTextInput(focusedInput);
        }
      } catch (error) {
      }

      const currentRouteName = navigationRef.getCurrentRoute()?.name;
      if (currentRouteName && SCANNER_ROUTES.has(currentRouteName)) {
        return;
      }

      setModalResult(result);
    };

    consumePendingHardwareScannerResult(handleGlobalScanResult);

    const scanSubscription = addHardwareScannerListener(handleGlobalScanResult);
    const appVisibilitySubscription = AppState.addEventListener('change', (state) => {
      setHardwareScannerAppInForeground(state === 'active');
      if (state === 'active') {
        promptForOverlayPermission();
      }
    });
    const appStateSubscription = addHardwareScannerAppStateListener(
      handleGlobalScanResult
    );

    return () => {
      setHardwareScannerAppInForeground(false);
      scanSubscription.remove();
      appVisibilitySubscription.remove();
      appStateSubscription.remove();
    };
  }, [authentication?.user?.access_token]);

  useEffect(() => {
    if (!modalResult) {
      return;
    }

    const timer = setTimeout(() => {
      setModalResult(null);
    }, RESULT_MODAL_DURATION);

    return () => clearTimeout(timer);
  }, [modalResult?.processedAt]);

  return (
    <>
      <ScanResultModal
        visible={showOverlayPermissionPrompt}
        success={true}
        title="Enable Scan Popups"
        message={OVERLAY_PROMPT_MESSAGE}
        actions={[
          {
            label: 'Not Now',
            variant: 'secondary',
            onPress: () => {
              setShowOverlayPermissionPrompt(false);
            },
          },
          {
            label: 'Open Settings',
            onPress: () => {
              setShowOverlayPermissionPrompt(false);
              openHardwareScannerOverlaySettings();
            },
          },
        ]}
      />
      <ScanResultModal
        visible={!!modalResult}
        success={!!modalResult?.success}
        title={modalResult?.success ? 'Scan Successful' : 'Scan Status'}
        message={modalResult?.message || ''}
      />
    </>
  );
};

export default HardwareScannerBootstrap;
