import React from 'react';
import { UserPlus, FileSpreadsheet, Printer, Moon, Sun, Smartphone, Download, GraduationCap, Camera, Sparkles, ScanBarcode } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'list' | 'report';
  setCurrentTab: (tab: 'dashboard' | 'list' | 'report') => void;
  onOpenAddModal: () => void;
  onOpenAIScan: () => void;
  onOpenBarcodeScan?: () => void;
  onExportExcel: () => void;
  onOpenPrintReport: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  isInstallable: boolean;
  onInstallPWA: () => void;
  isIOS: boolean;
  onOpenIOSGuide: () => void;
  isInstalled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAddModal,
  onOpenAIScan,
  onOpenBarcodeScan,
  onExportExcel,
  onOpenPrintReport,
  isDarkMode,
  setIsDarkMode,
  isInstallable,
  onInstallPWA,
  isIOS,
  onOpenIOSGuide,
  isInstalled,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0c4a34] dark:bg-[#073325] text-white shadow-md border-b-2 border-amber-400/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-6 h-16">
          {/* Zone 1: Single text wordmark with STOU academic motif */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-amber-400/70 flex items-center justify-center text-amber-300 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-base font-bold text-white tracking-tight whitespace-nowrap">
                  ระบบบันทึกสารสนเทศนักศึกษา มสธ. ลำปาง
                </span>
                <span className="text-[10px] sm:text-[11px] text-amber-300/95 font-medium whitespace-nowrap">
                  STOU Lampang Student Information Management System (SIMS)
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop / Tablet) */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-800 text-white font-semibold border-b-2 border-amber-400 shadow-xs'
                  : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              แดชบอร์ดภาพรวม
            </button>
            <button
              onClick={() => setCurrentTab('list')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'list'
                  ? 'bg-emerald-800 text-white font-semibold border-b-2 border-amber-400 shadow-xs'
                  : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              ทะเบียนประวัตินักศึกษา
            </button>
            <button
              onClick={() => onOpenPrintReport()}
              className="px-3 py-2 rounded-lg text-emerald-100/90 hover:text-white hover:bg-emerald-800/60 transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-emerald-200" />
              <span>พิมพ์รายงาน / PDF</span>
            </button>
            <button
              onClick={onExportExcel}
              className="px-3 py-2 rounded-lg text-emerald-100/90 hover:text-white hover:bg-emerald-800/60 transition-colors whitespace-nowrap flex items-center gap-1.5"
              title="ส่งออกรายชื่อและสรุปสถิติเป็นไฟล์ Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>ส่งออก Excel</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary CTA + AI camera trigger + utility controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* AI Camera OCR Button */}
            <button
              onClick={onOpenAIScan}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs font-semibold text-white bg-emerald-800/90 hover:bg-emerald-700/90 border border-amber-400/50 rounded-lg transition whitespace-nowrap min-h-[40px] shadow-xs"
              title="ถ่ายภาพหรืออัปโหลดรูปเอกสารนักศึกษาให้ AI อ่านและกรอกข้อมูลให้อัตโนมัติ"
            >
              <Camera className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">ถ่ายภาพ AI สแกน</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </button>

            {/* Barcode Scanner Button */}
            {onOpenBarcodeScan && (
              <button
                onClick={onOpenBarcodeScan}
                className="hidden md:flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs font-semibold text-emerald-100 hover:text-white bg-emerald-800/80 hover:bg-emerald-700/80 border border-emerald-700 rounded-lg transition whitespace-nowrap min-h-[40px]"
                title="สแกนบาร์โค้ดบัตรนักศึกษา มสธ."
              >
                <ScanBarcode className="w-4 h-4 text-amber-300" />
                <span className="hidden lg:inline">สแกนบาร์โค้ด</span>
              </button>
            )}

            {/* PWA Install Button */}
            {!isInstalled && isInstallable && (
              <button
                onClick={onInstallPWA}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-100 bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                ติดตั้งแอป
              </button>
            )}

            {!isInstalled && isIOS && (
              <button
                onClick={onOpenIOSGuide}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-100 bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                ติดตั้งบน iOS
              </button>
            )}

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle theme"
              className="p-2 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800/60 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-100" />}
            </button>

            {/* Primary Action Button (Green with gold border accent) */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border border-amber-300/80 rounded-lg shadow-md transition-all whitespace-nowrap min-h-[40px] focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">บันทึกนักศึกษาใหม่</span>
              <span className="sm:hidden">เพิ่ม</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
