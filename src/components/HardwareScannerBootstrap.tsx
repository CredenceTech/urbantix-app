import React, { useEffect, useState } from 'react';
import { AppState, Keyboard, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { navigationRef } from '../constants/root_navigation';
import { baseURL } from '../constants/api_constants';
import type { HardwareScannerResult } from '../../modules/urbantix-hardware-scanner';
import ScanResultModal from './ScanResultModal';
import SeasonTicketEventModal, {
  needsSeasonTicketEvent,
} from './SeasonTicketEventModal';
import { eventCheckin } from '../constants/services';
import {
  addHardwareScannerAppStateListener,
  addHardwareScannerListener,
  canDrawHardwareScannerOverlay,
  configureHardwareScannerSession,
  consumePendingHardwareScannerResult,
  ensureHardwareScannerNotificationPermission,
  isHardwareScannerSupported,
  openHardwareScannerOverlaySettings,
  setHardwareScannerAppInForeground,
  startHardwareScannerService,
  stopHardwareScannerService,
} from '../utils/hardwareScanner';

const SCANNER_ROUTES = new Set(['CheckIn', 'Check In']);
const RESULT_MODAL_DURATION = 1800;
const OVERLAY_PROMPT_MESSAGE =
  'Allow display over other apps so scan success and error messages can appear as a centered card when the app is in background or closed.';

const HardwareScannerBootstrap = () => {
  const authentication = useSelector((state: any) => state.authentication);
  const [modalResult, setModalResult] = useState<HardwareScannerResult | null>(null);
  const [showOverlayPermissionPrompt, setShowOverlayPermissionPrompt] = useState(false);
  const [pendingSeasonBarcode, setPendingSeasonBarcode] = useState<string | null>(null);
  const [submittingSeasonEvent, setSubmittingSeasonEvent] = useState(false);

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

    const promptForOverlayPermission = () => {
      if (!isHardwareScannerSupported()) {
        setShowOverlayPermissionPrompt(false);
        return;
      }

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

    if (isHardwareScannerSupported()) {
      ensureHardwareScannerNotificationPermission();
      startHardwareScannerService();
    }

    const handleGlobalScanResult = (result: HardwareScannerResult) => {
      try {
        Keyboard.dismiss();
        const focusedInput = TextInput.State.currentlyFocusedInput?.();
        if (focusedInput) {
          TextInput.State.blurTextInput(focusedInput);
        }
      } catch (error) {
      }

      const currentRouteName = (navigationRef.getCurrentRoute() as any)?.name;
      if (currentRouteName && SCANNER_ROUTES.has(currentRouteName)) {
        return;
      }

      if (!result.success && needsSeasonTicketEvent(result.message)) {
        setModalResult(null);
        setPendingSeasonBarcode(result.scannedCode);
        return;
      }

      setModalResult(result);
      promptForOverlayPermission();
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

  const submitSeasonTicketEvent = async (event: { id: number | string }) => {
    if (!pendingSeasonBarcode) return;
    setSubmittingSeasonEvent(true);
    const barcode = pendingSeasonBarcode;
    const result = await eventCheckin({barcode, event_id: event.id});
    setSubmittingSeasonEvent(false);
    setPendingSeasonBarcode(null);
    setModalResult({
      scannedCode: barcode,
      success: !!result?.success,
      message: result?.message || 'Ticket check-in failed.',
      mode: 'ticket',
      source: 'hardware',
      processedAt: Date.now(),
    });
  };

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

export default HardwareScannerBootstrap;
