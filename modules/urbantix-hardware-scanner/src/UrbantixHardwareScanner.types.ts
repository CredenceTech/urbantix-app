export type HardwareScannerMode = 'ticket' | 'student';

export type HardwareScannerSession = {
  authToken: string;
  baseUrl: string;
  mode: HardwareScannerMode;
  eventId?: number | null;
  userId?: number | null;
};

export type HardwareScannerResult = {
  scannedCode: string;
  success: boolean;
  message: string;
  mode: HardwareScannerMode | 'unknown';
  source: 'hardware';
  processedAt: number;
};

export type HardwareScannerEvents = {
  onScanResult: (event: HardwareScannerResult) => void;
};
