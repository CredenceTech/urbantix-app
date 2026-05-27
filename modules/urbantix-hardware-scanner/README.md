# urbantix-hardware-scanner

## Purpose

`urbantix-hardware-scanner` is a local Android-only Expo Module used by UrbanTix to integrate with rugged barcode-scanner devices that broadcast scan results at the OS level.

It exists so the app can:

- receive hardware scan broadcasts natively
- call UrbanTix check-in APIs even when the React UI is not active
- keep scan handling working in foreground, background, and killed-state scenarios
- show user feedback using themed in-app and Android-native popup surfaces

This module is designed around the scanner vendor SDK behavior documented in:

- `SDK development manual for scanner module pdf.pdf`

## SDK Mapping

The implementation follows the scanner SDK manual’s broadcast-based model.

### Scan result broadcast

From the SDK manual:

- action: `com.android.serial.BARCODEPORT_RECEIVEDDATA_ACTION`
- result data key: `DATA`

This module listens for that exact action and reads the scanned barcode from `DATA`.

### Trigger scan broadcasts

From the SDK manual:

- scan key down: `com.android.action.keyevent.KEYCODE_KEYCODE_SCAN_L_DOWN`
- scan key up: `com.android.action.keyevent.KEYCODE_KEYCODE_SCAN_L_UP`

These are exposed by the module as:

- `startScan()`
- `stopScan()`

### Why this matches the SDK manual

The manual’s model is:

1. scanner hardware scans outside the app
2. Android broadcasts the scan result
3. app registers or declares a receiver and reads the scan payload

That is exactly what this module does.

## Why an Expo Module

This was implemented as a local Expo Module instead of a plain custom React Native native package because:

- it fits the existing Expo app structure
- it autolinks during `expo prebuild`
- it keeps Android-only native code isolated under `modules/`
- it gives a clean JS bridge for scanner session management and event delivery

Module config:

- [expo-module.config.json](/urbantix-app/modules/urbantix-hardware-scanner/expo-module.config.json)

## Supported Platform

- Android only

This module is not intended for iOS.

## Directory Layout

### JS bridge

- [index.ts](/urbantix-app/modules/urbantix-hardware-scanner/index.ts)
- [src/UrbantixHardwareScanner.ts](/urbantix-app/modules/urbantix-hardware-scanner/src/UrbantixHardwareScanner.ts)
- [src/UrbantixHardwareScanner.types.ts](/urbantix-app/modules/urbantix-hardware-scanner/src/UrbantixHardwareScanner.types.ts)

### Android native code

- [android/src/main/AndroidManifest.xml](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/AndroidManifest.xml)
- [android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerModule.kt](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerModule.kt)
- [android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerReceiver.kt](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerReceiver.kt)
- [android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerService.kt](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerService.kt)
- [android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerProcessor.kt](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerProcessor.kt)
- [android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerOverlay.kt](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerOverlay.kt)
- [android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerStore.kt](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerStore.kt)

## Architecture

## 1. JS configures scanner session

The app configures native session state through:

- `configureSession(...)`

Current session data:

- `authToken`
- `baseUrl`
- `mode`
- `eventId` when needed
- `userId` when needed

In current production usage, the shared hardware flow uses:

- `mode: "ticket"`

Main integration point:

- [HardwareScannerBootstrap.tsx](/urbantix-app/src/components/HardwareScannerBootstrap.tsx)

### Supported-device strategy

The module now works across two Android categories:

- rugged scanner devices with hardware scan buttons
- normal Android phones without scanner hardware

Current strategy:

- the runtime foreground receiver is always registered
- JS session and foreground listener setup still runs on Android
- the background foreground-service path is only activated for confirmed/supported scanner devices

A device becomes confirmed/supported when either:

- it matches a known rugged-scanner vendor hint, or
- the app receives a real hardware scan in foreground and stores that confirmation natively

This lets normal phones avoid the hardware-service path while still allowing real scanner devices to unlock background and killed-state support after the first foreground hardware scan.

## 2. Native receives the broadcast

The module uses three native receiver paths:

### Runtime receiver

Declared inside [UrbantixHardwareScannerModule.kt](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerModule.kt).

Purpose:

- active app / foreground handling

It only processes when:

- `isAppInForeground == true`

### Foreground service receiver

Declared inside [UrbantixHardwareScannerService.kt](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerService.kt).

Purpose:

- background handling
- keeping scanner support alive when React UI is torn down

The service is started from JS after a valid logged-in session is present.
After the current compatibility changes, it is only started on confirmed/supported scanner devices.

### Manifest receiver

Declared in:

- [AndroidManifest.xml](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/AndroidManifest.xml)
- [UrbantixHardwareScannerReceiver.kt](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerReceiver.kt)

Purpose:

- killed-state fallback
- cases where the app process is relaunched by the scan broadcast

It skips work when:

- app is already foregrounded
- scanner service is already active

That prevents duplicate processing.

## 3. Native processes the scan

All receivers eventually route scan handling to:

- [UrbantixHardwareScannerProcessor.kt](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerProcessor.kt)

Responsibilities:

- load saved scanner session
- validate auth/session state
- build API payload
- call UrbanTix API
- persist latest result
- emit live event to JS
- show feedback popup or fallback notification

## 4. Native stores result

Persistent session and result state is stored in:

- [UrbantixHardwareScannerStore.kt](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerStore.kt)

This is used for:

- keeping the last valid scanner session
- allowing pending scan results to be consumed later by JS
- remembering whether this device has been confirmed as a real hardware-scanner device

## 5. JS consumes live or pending result

The JS wrapper:

- [src/UrbantixHardwareScanner.ts](/urbantix-app/modules/urbantix-hardware-scanner/src/UrbantixHardwareScanner.ts)

exposes:

- `configureSession`
- `clearSession`
- `getPendingScanResult`
- `clearPendingScanResult`
- `startScan`
- `stopScan`
- `startScannerService`
- `stopScannerService`
- `canDrawOverlays`
- `openOverlayPermissionSettings`
- `setAppInForeground`
- `addScanResultListener`

In the app, [src/utils/hardwareScanner.ts](/Users/prahlad/Work/urbantix-app/src/utils/hardwareScanner.ts) wraps those APIs for React usage.
In the app, [src/utils/hardwareScanner.ts](/urbantix-app/src/utils/hardwareScanner.ts) wraps those APIs for React usage.

## API Behavior

The shared hardware flow currently targets normal ticket check-in:

- endpoint: `POST /transactions/barcodeCheckIn`

Payload:

```json
{
  "barcode": "SCANNED_CODE"
}
```

Student-pass support still exists in native processing, but it is not the shared production hardware path right now.

## UI / Feedback Strategy

## Foreground

Foreground UI is handled inside React Native.

Used components:

- [ScanResultModal.tsx](/urbantix-app/src/components/ScanResultModal.tsx)
- [QRCodeScanner.tsx](/urbantix-app/src/screens/QRCodeScanner.tsx)

Behavior:

- if the user is already on `CheckIn`, that screen handles the result
- otherwise a centered themed modal is shown

## Background and killed

Background and killed-state UI is handled natively by:

- [UrbantixHardwareScannerOverlay.kt](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/java/expo/modules/urbantixhardwarescanner/UrbantixHardwareScannerOverlay.kt)

Behavior:

- centered popup card
- auto-dismiss
- app-themed styling

Fallback:

- Android notification if overlay permission is not granted or overlay cannot be shown

Overlay permission prompt behavior:

- normal Android phones: no overlay prompt
- confirmed scanner devices: prompt appears after support is confirmed, usually after the first foreground hardware scan

## Permissions

### Foreground service permissions

Declared in [android/src/main/AndroidManifest.xml](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/AndroidManifest.xml):

- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_DATA_SYNC`

These are required for the scanner foreground service on newer Android versions / target SDK levels.

Declared in:

- [AndroidManifest.xml](/urbantix-app/modules/urbantix-hardware-scanner/android/src/main/AndroidManifest.xml)
- [app.json](/urbantix-app/app.json)

Permissions used:

- `POST_NOTIFICATIONS`
- `FOREGROUND_SERVICE`
- `SYSTEM_ALERT_WINDOW`

### Why each permission exists

`POST_NOTIFICATIONS`

- fallback scan result notification

`FOREGROUND_SERVICE`

- keep background scanner listener alive

`SYSTEM_ALERT_WINDOW`

- show centered background/killed-state popup over other apps

## Service lifecycle

The foreground service must survive normal React cleanup for killed-state scanning to work.

Current rule:

- start when authenticated session exists
- do not stop during ordinary component unmount
- stop when no user token exists, such as logout

This is implemented in:

- [HardwareScannerBootstrap.tsx](/urbantix-app/src/components/HardwareScannerBootstrap.tsx)

## How this follows the SDK manual

The SDK manual’s core expectation is that scanning is hardware-driven and app integration happens by listening to broadcast intents.

This module follows that directly:

1. native code listens for the exact scan result action from the manual
2. it reads the exact result key from the manual
3. it optionally exposes scan trigger broadcasts matching the manual
4. it avoids depending on camera scanning for the hardware flow
5. it keeps broadcast handling in Android native code where background and killed-state behavior can exist

In other words, the implementation is based on the SDK’s intended integration pattern, not on a camera-scanner abstraction.

## App Integration Notes

Main app files:

- [HardwareScannerBootstrap.tsx](/urbantix-app/src/components/HardwareScannerBootstrap.tsx)
- [QRCodeScanner.tsx](/urbantix-app/src/screens/QRCodeScanner.tsx)
- [hardwareScanner.ts](/urbantix-app/src/utils/hardwareScanner.ts)

Important:

- shared hardware scanner flow is tied to the main `CheckIn` scanner
- [SchoolQRCodeScanner.tsx](/urbantix-app/src/screens/SchoolQRCodeScanner.tsx) is now separate camera-only student flow

## Build and Rebuild

After any native module change:

```bash
npx expo prebuild --clean
npx expo run:android
```

## Known Constraints

- killed-state behavior still depends on Android/OEM broadcast behavior
- overlay popup depends on `SYSTEM_ALERT_WINDOW`
- notification fallback depends on `POST_NOTIFICATIONS`
- hardware scanner device should be configured for broadcast output, not keyboard wedge output

Recommended device configuration:

- broadcast output enabled
- keyboard wedge disabled
- action `com.android.serial.BARCODEPORT_RECEIVEDDATA_ACTION`
- data key `DATA`

## Related App Docs

For app-level behavior and test notes, see:

- [docs/hardware-scanner.md](/urbantix-app/docs/hardware-scanner.md)
