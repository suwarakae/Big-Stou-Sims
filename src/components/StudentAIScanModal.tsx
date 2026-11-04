import React, { useState, useRef } from 'react';
import { Student, DEFAULT_STOU_CENTER } from '../types/student';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText, 
  RefreshCw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface StudentAIScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (extractedData: Partial<Student>) => void;
}

export const StudentAIScanModal: React.FC<StudentAIScanModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<Student> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    setErrorMessage(null);
    setExtractedData(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      // Auto trigger AI extraction for smooth user experience
      extractWithAI(base64, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const extractWithAI = async (base64Data: string, type: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/scan-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: type,
        }),
      });

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'ไม่สามารถสกัดข้อมูลจากภาพได้ กรุณาลองใหม่อีกครั้ง');
      }

      const data = result.data;

      // Ensure STOU Lampang center is set
      data.stouCenter = DEFAULT_STOU_CENTER;

      setExtractedData(data);
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ AI สแกนเอกสาร');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmApply = () => {
    if (extractedData) {
      onApplyData(extractedData);
      onClose();
    }
  };

  const resetScan = () => {
    setSelectedImage(null);
    setExtractedData(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>ถ่ายภาพ / ส่งรูปเอกสาร AI สแกนอัตโนมัติ</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                มสธ. ลำปาง · ลดเวลาพิมพ์และป้องกันความผิดพลาดจากการคีย์ข้อมูล
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.pdf"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Step 1: Upload or Take Photo (if no image selected) */}
          {!selectedImage ? (
            <div className="space-y-4">
              <div className="p-8 border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/10 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    ถ่ายรูปหรืออัปโหลดภาพเอกสารนักศึกษา
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
                    รองรับภาพถ่ายบัตรนักศึกษา มสธ., ใบเสร็จลงทะเบียนเรียน, ทะเบียนประวัติ, เอกสารสมัครเรียน หรือบัตรประชาชน ระบบ AI จะอ่านและกรอกข้อมูลให้ทันที
                  </p>
                </div>

                {/* Mobile / Tablet Touch Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-medium text-xs sm:text-sm shadow-md transition min-h-[46px]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>ถ่ายภาพด้วยกล้อง (มือถือ/ไอแพด)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 font-medium text-xs sm:text-sm shadow-2xs transition min-h-[46px]"
                  >
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>เลือกไฟล์รูปภาพจากคลัง</span>
                  </button>
                </div>
              </div>

              {/* Helpful Tips */}
              <div className="bg-neutral-50 dark:bg-neutral-850 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  คำแนะนำเพื่อให้สแกนได้แม่นยำสูงสุด:
                </span>
                <p>• วางเอกสารบนพื้นผิวเรียบที่มีแสงสว่างเพียงพอ ไม่ให้มีเงาบังตัวหนังสือ</p>
                <p>• ถ่ายให้เห็นตัวเลขรหัสนักศึกษา 10 หลักและชื่อ-นามสกุล ชัดเจน</p>
                <p>• สามารถตรวจสอบและแก้ไขข้อมูลเพิ่มเติมได้ก่อนกดยืนยันบันทึก</p>
              </div>
            </div>
          ) : (
            /* Step 2: Image Preview & AI Extraction Result */
            <div className="space-y-4">
              {/* Image Preview & Status Row */}
              <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-850 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-neutral-200"
                  />
                  <div>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                      รูปภาพเอกสารนักศึกษา
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {isLoading ? 'AI กำลังประมวลผลข้อความ...' : 'สแกนเสร็จสิ้น'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={resetScan}
                  className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ถ่ายใหม่</span>
                </button>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto animate-spin">
                    <Loader2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      AI กำลังอ่านและวิเคราะห์ข้อมูลจากภาพถ่าย...
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      กำลังตรวจหารหัสนักศึกษา มสธ., ชื่อ-นามสกุล, สาขาวิชา, ที่อยู่ และเบอร์ติดต่อ
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{errorMessage}</p>
                    <button
                      onClick={() => extractWithAI(selectedImage, mimeType)}
                      className="mt-2 text-emerald-700 dark:text-emerald-400 underline font-medium"
                    >
                      ลองใหม่อีกครั้ง
                    </button>
                  </div>
                </div>
              )}

              {/* Extracted Data Card */}
              {extractedData && !isLoading && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>AI สกัดข้อมูลสำเร็จ! กรุณาตรวจสอบข้อมูลด้านล่างก่อนนำเข้าแบบฟอร์ม:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-neutral-50 dark:bg-neutral-850 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">รหัสนักศึกษา:</span>
                      <span className="font-mono font-bold text-sm text-emerald-800 dark:text-emerald-400">
                        {extractedData.studentId || '(ไม่พบในภาพ - ระบุภายหลังได้)'}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">ชื่อ-นามสกุล:</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {extractedData.title || ''}{extractedData.firstName || '-'} {extractedData.lastName || '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">สาขาวิชา:</span>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {extractedData.faculty || 'สาขาวิชาวิทยาการจัดการ'}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">แขนงวิชา/วิชาเอก:</span>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {extractedData.major || '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">เบอร์โทรศัพท์:</span>
                      <span className="font-mono text-neutral-800 dark:text-neutral-200">
                        {extractedData.phone || '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">จังหวัด:</span>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {extractedData.province || 'ลำปาง'}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-neutral-500 block text-[11px]">ที่อยู่:</span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {extractedData.address || '-'} {extractedData.subdistrict ? `ต.${extractedData.subdistrict}` : ''} {extractedData.district ? `อ.${extractedData.district}` : ''} {extractedData.postalCode || ''}
                      </span>
                    </div>

                    {extractedData.notes && (
                      <div className="sm:col-span-2 pt-1 border-t border-neutral-200 dark:border-neutral-750">
                        <span className="text-neutral-500 block text-[11px]">หมายเหตุที่อ่านได้:</span>
                        <span className="text-neutral-600 dark:text-neutral-400 italic">
                          {extractedData.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition min-h-[44px]"
          >
            ปิด
          </button>

          {extractedData && (
            <button
              type="button"
              onClick={handleConfirmApply}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0c4a34] hover:bg-emerald-800 active:bg-emerald-950 border border-amber-400/70 rounded-xl shadow-md transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <span>นำเข้าข้อมูลสู่แบบฟอร์ม</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
