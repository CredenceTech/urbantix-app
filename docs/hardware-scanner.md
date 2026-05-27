# Hardware Scanner Feature

## Overview

This app supports Android hardware barcode scanning through a local Expo Module.

The scanner device is expected to broadcast:

- result action: `com.android.serial.BARCODEPORT_RECEIVEDDATA_ACTION`
- result data key: `DATA`
- trigger scan down: `com.android.action.keyevent.KEYCODE_KEYCODE_SCAN_L_DOWN`
- trigger scan up: `com.android.action.keyevent.KEYCODE_KEYCODE_SCAN_L_UP`

The native layer listens for those broadcasts, calls the UrbanTix API natively, stores the latest scan result, emits live events to JavaScript when the app is active, and shows a themed overlay popup for background or killed-state scan feedback.

## Scope

Primary supported hardware flow:

- normal ticket scan via `/transactions/barcodeCheckIn`

Student pass support still exists in the app, but it is not part of the shared hardware-scanner flow anymore.

- main shared hardware flow: [QRCodeScanner.tsx](/Users/prahlad/Work/urbantix-app/src/screens/QRCodeScanner.tsx)
- student pass camera flow only: [SchoolQRCodeScanner.tsx](/Users/prahlad/Work/urbantix-app/src/screens/SchoolQRCodeScanner.tsx)

## File Map

### Expo module

- [expo-module.config.json](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/expo-module.config.json)
- [index.ts](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/index.ts)
- [UrbantixHardwareScanner.ts](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/src/UrbantixHardwareScanner.ts)
- [UrbantixHardwareScanner.types.ts](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/src/UrbantixHardwareScanner.types.ts)

### Android native implementation

- [AndroidManifest.xml](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/AndroidManifest.xml)
- [UrbantixHardwareScannerModule.kt](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerModule.kt)
- [UrbantixHardwareScannerReceiver.kt](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerReceiver.kt)
- [UrbantixHardwareScannerService.kt](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerService.kt)
- [UrbantixHardwareScannerProcessor.kt](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerProcessor.kt)
- [UrbantixHardwareScannerOverlay.kt](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerOverlay.kt)
- [UrbantixHardwareScannerStore.kt](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerStore.kt)

### App integration

- [HardwareScannerBootstrap.tsx](/Users/prahlad/Work/urbantix-app/src/components/HardwareScannerBootstrap.tsx)
- [ScanResultModal.tsx](/Users/prahlad/Work/urbantix-app/src/components/ScanResultModal.tsx)
- [hardwareScanner.ts](/Users/prahlad/Work/urbantix-app/src/utils/hardwareScanner.ts)
- [QRCodeScanner.tsx](/Users/prahlad/Work/urbantix-app/src/screens/QRCodeScanner.tsx)
- [SchoolQRCodeScanner.tsx](/Users/prahlad/Work/urbantix-app/src/screens/SchoolQRCodeScanner.tsx)
- [app.json](/Users/prahlad/Work/urbantix-app/app.json)

## High-Level Flow

## 1. Session setup

After login, [HardwareScannerBootstrap.tsx](/Users/prahlad/Work/urbantix-app/src/components/HardwareScannerBootstrap.tsx):

- configures a native scanner session in `ticket` mode
- marks whether the app is foregrounded
- always attaches foreground scan listeners
- only starts the Android foreground service on confirmed/supported scanner devices

Saved session data includes:

- `authToken`
- `baseUrl`
- `mode`

For the shared hardware flow, `mode` is currently always `ticket`.

## Supported device behavior

The app now supports both:

- rugged Android scanner devices
- normal Android phones without scanner hardware

How it works:

- the runtime foreground receiver is always available on Android
- normal phones do not receive scanner broadcasts, so they continue using camera QR scanning only
- scanner devices are considered hardware-supported when either:
  - the device matches a known rugged-scanner vendor hint, or
  - the app receives a real hardware scan in foreground and confirms support natively

After the first successful foreground hardware scan on a scanner device:

- the device is marked as hardware-scanner capable
- the scanner foreground service is started
- background and killed-state scanner handling becomes available

## 2. Scan result broadcast arrives

The device sends:

- action: `com.android.serial.BARCODEPORT_RECEIVEDDATA_ACTION`
- data extra: `DATA`

Native code reads the scanned code and routes it through one of three handlers depending on app state.

## 3. State-specific native handlers

### Foreground

Handled by the runtime receiver in [UrbantixHardwareScannerModule.kt](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerModule.kt).

It only processes scans when:

- `isAppInForeground === true`

### Background

Handled by the foreground service receiver in [UrbantixHardwareScannerService.kt](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerService.kt).

The service stays alive after the app UI is closed, as long as the user still has an active logged-in session.

On scanner devices, this service is started after hardware support is confirmed.

### Killed or no active service

Handled by the manifest receiver in [UrbantixHardwareScannerReceiver.kt](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerReceiver.kt).

The manifest receiver skips processing when:

- the app is foregrounded, or
- the foreground service is already active

That prevents duplicate processing.

## 4. Native API call

In [UrbantixHardwareScannerProcessor.kt](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerProcessor.kt), ticket mode calls:

- `POST /transactions/barcodeCheckIn`

Payload:

```json
{
  "barcode": "SCANNED_CODE"
}
```

## 5. Result persistence and delivery

After the API returns:

- result is saved as pending native scan state
- result is emitted to JS listeners when relevant
- background or killed flow shows a themed Android overlay popup
- notification is used only as fallback when overlay cannot be shown

Saved result fields:

- `scannedCode`
- `success`
- `message`
- `mode`
- `source`
- `processedAt`

## UI Behavior

## Foreground

In foreground, the app uses React Native UI:

- shared global result popup: [ScanResultModal.tsx](/Users/prahlad/Work/urbantix-app/src/components/ScanResultModal.tsx)
- screen-specific scanner result handling: [QRCodeScanner.tsx](/Users/prahlad/Work/urbantix-app/src/screens/QRCodeScanner.tsx)

The foreground result popup:

- is centered
- matches the app theme
- auto-dismisses after about 1.8 seconds

## Background and killed

In background or killed state, Android uses:

- [UrbantixHardwareScannerOverlay.kt](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerOverlay.kt)

The overlay popup:

- is centered on screen
- auto-dismisses after about 1.6 seconds
- uses the same black/green themed card style as the in-app modal

If Android overlay permission is missing, the code falls back to a top notification.

## Permissions

## Notifications

Needed for fallback notification behavior.

Configured in [app.json](/Users/prahlad/Work/urbantix-app/app.json):

- `POST_NOTIFICATIONS`

Android 13+ requires runtime permission.

## Overlay popup

Needed for centered background/killed-state popup cards.

Configured in:

- [AndroidManifest.xml](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/AndroidManifest.xml)
- [app.json](/Users/prahlad/Work/urbantix-app/app.json)

Permission:

- `SYSTEM_ALERT_WINDOW`

The app prompts for this using the themed modal in [HardwareScannerBootstrap.tsx](/Users/prahlad/Work/urbantix-app/src/components/HardwareScannerBootstrap.tsx).

Prompt behavior:

- normal Android phones: no overlay prompt
- scanner devices: prompt appears after hardware support is confirmed, typically right after the first foreground hardware scan

Tapping `Open Settings` sends the user to Android overlay permission settings.

## Foreground service permissions

Configured in [AndroidManifest.xml](/Users/prahlad/Work/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/AndroidManifest.xml):

- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_DATA_SYNC`

These are required for the background scanner service on newer Android versions / higher target SDKs.

## Service lifecycle

The hardware scanner foreground service is started only when the device is confirmed/supported for hardware scanning.

Important behavior:

- the service is not stopped during normal React component cleanup
- this is required so killed-state scanning keeps working
- the service is stopped when there is no authenticated user token

On normal Android phones without scanner hardware:

- the service is not started
- overlay prompts are not shown
- camera QR scanning remains the active scan path

This logic lives in [HardwareScannerBootstrap.tsx](/Users/prahlad/Work/urbantix-app/src/components/HardwareScannerBootstrap.tsx).

## Current app behavior

## Main shared hardware scanner

The shared hardware flow is tied to:

- [QRCodeScanner.tsx](/Users/prahlad/Work/urbantix-app/src/screens/QRCodeScanner.tsx)

If the user is on another screen and a hardware scan happens:

- the app stays on the current screen
- a themed result popup is shown in foreground

If the user is already on the `CheckIn` screen:

- the scanner screen handles the result directly

## Student pass screen

[SchoolQRCodeScanner.tsx](/Users/prahlad/Work/urbantix-app/src/screens/SchoolQRCodeScanner.tsx) remains a separate camera-based student pass flow.

It is no longer part of the shared hardware-scanner session/listener flow.

## Device configuration requirement

The scanner device should be configured to use broadcast output.

Recommended scanner device settings:

- enable broadcast or intent output
- disable keyboard wedge or keystroke output
- action should be `com.android.serial.BARCODEPORT_RECEIVEDDATA_ACTION`
- data key should be `DATA`

If keyboard wedge remains enabled, the scan code may be injected into focused text inputs and trigger unrelated app behavior.

## Build Steps

After changing the local Expo module or Android manifest:

```bash
npx expo prebuild --clean
```

Then rebuild Android:

```bash
npx expo run:android
```

## Recommended Test Plan

## Ticket scan

1. Login
2. Confirm scanner service starts
3. Open app and scan in foreground
4. Put app in background and scan again
5. Kill app and scan again
6. Confirm API response is shown in each state

Expected:

- foreground: in-app themed modal or scanner screen result
- background: centered overlay popup
- killed: centered overlay popup, or notification fallback if overlay permission is missing

## Permission flow

1. Install app fresh
2. Login
3. Deny overlay permission
4. Background scan
5. Confirm notification fallback appears
6. Re-open app
7. Tap `Open Settings` in the themed permission prompt
8. Enable overlay permission
9. Background scan again
10. Confirm centered overlay popup appears instead of notification

## Error scenarios

Verify:

- invalid barcode
- already scanned ticket
- missing auth token
- missing stored session
- network failure

## Known Risks

- killed-state behavior still depends on OEM scanner and Android process behavior
- overlay popup depends on `SYSTEM_ALERT_WINDOW`
- notification fallback depends on `POST_NOTIFICATIONS`
- if the user logs out, the scanner service stops and hardware scanning should no longer process scans
