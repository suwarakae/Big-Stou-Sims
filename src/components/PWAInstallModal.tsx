import React from 'react';
import { Smartphone, Share, PlusSquare, X } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              วิธีติดตั้งบน iPhone / iPad
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-neutral-600 dark:text-neutral-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold">
              1
            </div>
            <div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                แตะปุ่มแชร์ (Share Button)
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1">
                อยู่ที่แถบเมนูด้านล่างหรือบนของ Safari <Share className="w-3.5 h-3.5 inline text-blue-500" />
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold">
              2
            </div>
            <div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                เลือก "เพิ่มไปยังหน้าจอโฮม"
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1">
                (Add to Home Screen) <PlusSquare className="w-3.5 h-3.5 inline text-emerald-600" />
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold">
              3
            </div>
            <div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                แตะ "เพิ่ม" (Add) มุมขวาบน
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                แอปจะถูกติดตั้งเป็นไอคอนบนหน้าจอ ใช้งานได้เหมือนแอปแท้โดยไม่ต้องเปิดบราวเซอร์
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 transition min-h-[44px]"
        >
          เข้าใจแล้ว
        </button>
      </div>
    </div>
  );
};
