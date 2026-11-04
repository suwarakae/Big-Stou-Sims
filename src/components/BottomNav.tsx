import React from 'react';
import { LayoutDashboard, Users, UserPlus, Printer, Camera } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'dashboard' | 'list' | 'report';
  setCurrentTab: (tab: 'dashboard' | 'list' | 'report') => void;
  onOpenAddModal: () => void;
  onOpenAIScan: () => void;
  onOpenPrintReport: () => void;
  studentCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAddModal,
  onOpenAIScan,
  onOpenPrintReport,
  studentCount,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c4a34] dark:bg-[#073325] text-white border-t-2 border-amber-400/80 shadow-xl pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* Tab 1: แดชบอร์ด */}
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'dashboard'
              ? 'text-amber-300 font-bold'
              : 'text-emerald-100/75 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">แดชบอร์ด</span>
          {currentTab === 'dashboard' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
          )}
        </button>

        {/* Tab 2: ทะเบียนนักศึกษา */}
        <button
          onClick={() => setCurrentTab('list')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] relative transition-colors ${
            currentTab === 'list'
              ? 'text-amber-300 font-bold'
              : 'text-emerald-100/75 hover:text-white'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 text-[9px] font-mono font-bold px-1 rounded-full bg-amber-400 text-emerald-950">
              {studentCount}
            </span>
          </div>
          <span className="text-[10px] mt-1 tracking-tight">รายชื่อ</span>
          {currentTab === 'list' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
          )}
        </button>

        {/* Tab 3: ถ่ายภาพสแกน AI */}
        <button
          onClick={onOpenAIScan}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-white active:scale-95 transition-transform"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center shadow-md ring-2 ring-amber-300/60 font-bold">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-[9px] mt-1 font-semibold text-amber-300">
            สแกน AI
          </span>
        </button>

        {/* Tab 4: เพิ่มข้อมูล (ปุ่มหลัก) */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-emerald-100 hover:text-white transition-colors"
        >
          <div className="p-1 rounded-lg bg-emerald-800/80 border border-amber-400/50">
            <UserPlus className="w-4 h-4 text-amber-300" />
          </div>
          <span className="text-[10px] mt-0.5 font-medium">
            คีย์ข้อมูล
          </span>
        </button>

        {/* Tab 5: รายงาน / พิมพ์ */}
        <button
          onClick={onOpenPrintReport}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-emerald-100/75 hover:text-white transition-colors"
        >
          <Printer className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">พิมพ์/PDF</span>
        </button>
      </div>
    </nav>
  );
};
