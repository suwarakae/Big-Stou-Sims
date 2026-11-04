import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanBarcode, X, Camera, Upload, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatStudentId } from '../utils/validation';

interface StudentBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedId: string) => void;
}

export const StudentBarcodeScannerModal: React.FC<StudentBarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'barcode-reader-viewport';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setScannedResult(null);
      setScannerError(null);
      return;
    }

    // Start scanner when modal opens
    startScanner();

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    setScannerError(null);
    setScannedResult(null);

    try {
      // Clean up previous instance if any
      if (scannerInstanceRef.current) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerInstanceRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 140 }, // Wide box optimized for 1D Barcode on student ID cards
        aspectRatio: 1.777778,
      };

      await html5QrCode.start(
        { facingMode: 'environment' }, // Back camera on mobile/iPad
        config,
        (decodedText) => {
          handleDetectedCode(decodedText);
        },
        (_errorMessage) => {
          // Frame by frame scan errors are normal while looking for barcode
        }
      );

      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Unable to start live camera for barcode:', err);
      setIsCameraActive(false);
      setScannerError(
        'ไม่สามารถเข้าถึงกล้องถ่ายภาพได้ กรุณาอนุญาตการเข้าถึงกล้อง หรือใช้ปุ่ม "เลือกรูปภาพบาร์โค้ด" แทน'
      );
    }
  };

  const stopScanner = async () => {
    if (scannerInstanceRef.current) {
      try {
        if (scannerInstanceRef.current.isScanning) {
          await scannerInstanceRef.current.stop();
        }
        await scannerInstanceRef.current.clear();
      } catch (err) {
        console.error('Error stopping barcode scanner:', err);
      } finally {
        scannerInstanceRef.current = null;
        setIsCameraActive(false);
      }
    }
  };

  const handleDetectedCode = (rawCode: string) => {
    if (!rawCode) return;

    // Extract digits only (or clean student ID)
    const digitsOnly = rawCode.replace(/\D/g, '');
    const cleanId = digitsOnly.length >= 10 ? digitsOnly.slice(0, 10) : digitsOnly || rawCode.trim();

    // Sound / Haptic feedback if supported
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(80);
    }

    setScannedResult(cleanId);
    stopScanner();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannerError(null);
    setScannedResult(null);

    try {
      const html5QrCode = new Html5Qrcode('barcode-file-temp');
      const result = await html5QrCode.scanFile(file, true);
      handleDetectedCode(result);
      await html5QrCode.clear();
    } catch (err) {
      console.error('Failed to scan file for barcode:', err);
      setScannerError('ไม่พบบาร์โค้ดที่ชัดเจนในรูปภาพ กรุณาถ่ายให้เห็นบาร์โค้ดในระยะใกล้และมีแสงสว่าง');
    }
  };

  const handleConfirmResult = () => {
    if (scannedResult) {
      onScanSuccess(scannedResult);
      onClose();
    }
  };

  const handleScanAgain = () => {
    setScannedResult(null);
    setScannerError(null);
    startScanner();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-850/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-sm">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                สแกนบาร์โค้ดบัตรนักศึกษา
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                อ่านรหัสนักศึกษา 10 หลักอัตโนมัติจากแท่งบาร์โค้ด
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden inputs & temp elements */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <div id="barcode-file-temp" className="hidden" />

        {/* Body Viewport */}
        <div className="p-5 space-y-4">
          {/* If Result Detected */}
          {scannedResult ? (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium block">
                  สแกนบาร์โค้ดสำเร็จ!
                </span>
                <span className="text-2xl font-mono font-bold tracking-widest text-emerald-900 dark:text-emerald-200 mt-1 block tabular-nums">
                  {formatStudentId(scannedResult)}
                </span>
                <span className="text-[11px] text-neutral-500 mt-0.5 block">
                  (รหัสนักศึกษา: {scannedResult})
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>สแกนใหม่</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmResult}
                  className="px-5 py-2.5 rounded-xl bg-[#0c4a34] hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 border border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <span>ใช้รหัสนักศึกษานี้</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Viewfinder or Upload Fallback */
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-neutral-950 aspect-video flex items-center justify-center border border-neutral-800 shadow-inner">
                {/* HTML5 QR Code Container */}
                <div id={scannerContainerId} className="w-full h-full" />

                {/* Overlaid Target Guide Lines (When Camera Active) */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-28 border-2 border-amber-400/80 rounded-xl relative shadow-lg">
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-amber-300 rounded-tl" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-amber-300 rounded-tr" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-amber-300 rounded-bl" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-amber-300 rounded-br" />
                      {/* Laser scanning red guide line */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500/80 shadow-sm shadow-rose-500 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Guide Notice */}
              <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                จัดตำแหน่งให้แถบบาร์โค้ดของบัตรนักศึกษา มสธ. อยู่ภายในกรอบสีเหลือง
              </p>

              {/* Error Notice if camera fails */}
              {scannerError && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{scannerError}</p>
                </div>
              )}

              {/* Alternative Options: Direct Native Camera & File Upload for Mobile/iPad */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row gap-2 justify-center">
                <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 border border-emerald-700 transition cursor-pointer select-none min-h-[42px]">
                  <Camera className="w-3.5 h-3.5 text-amber-300" />
                  <span>ถ่ายภาพบาร์โค้ดด้วยกล้อง (มือถือ/ไอแพด)</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>

                <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer select-none min-h-[42px]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>เลือกรูปภาพบาร์โค้ดจากแกลเลอรี</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition min-h-[40px]"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
