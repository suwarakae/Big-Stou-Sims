import React, { useRef } from 'react';
import { Student } from '../types/student';
import { 
  Users, 
  GraduationCap, 
  Clock, 
  Award, 
  TrendingUp, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  MapPin, 
  ChevronRight,
  UserCheck,
  Camera,
  Sparkles
} from 'lucide-react';
import { formatPhoneNumber, formatStudentId } from '../utils/validation';

interface DashboardProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onNavigateToList: (filter?: { faculty?: string; status?: string }) => void;
  onExportExcel: () => void;
  onOpenPrintReport: () => void;
  onOpenAddModal: () => void;
  onOpenAIScan: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  onSelectStudent,
  onNavigateToList,
  onExportExcel,
  onOpenPrintReport,
  onOpenAddModal,
  onOpenAIScan,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Computed Metrics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'กำลังศึกษา').length;
  const graduatedStudents = students.filter((s) => s.status === 'สำเร็จการศึกษา').length;
  const leaveStudents = students.filter(
    (s) => s.status === 'พักการเรียน' || s.status === 'รักษาสถานภาพ'
  ).length;

  // Breakdown by Faculty
  const facultyCounts: Record<string, number> = {};
  students.forEach((s) => {
    facultyCounts[s.faculty] = (facultyCounts[s.faculty] || 0) + 1;
  });
  const facultyList = Object.entries(facultyCounts).sort((a, b) => b[1] - a[1]);
  const maxFacultyCount = Math.max(...Object.values(facultyCounts), 1);

  // Breakdown by Status
  const statusCounts: Record<string, number> = {
    กำลังศึกษา: 0,
    สำเร็จการศึกษา: 0,
    พักการเรียน: 0,
    รักษาสถานภาพ: 0,
    'พ้นสภาพการเป็นนักศึกษา': 0,
  };
  students.forEach((s) => {
    if (statusCounts[s.status] !== undefined) {
      statusCounts[s.status]++;
    }
  });

  // Breakdown by Province (Focusing on Northern Service Area of STOU Lampang)
  const provinceCounts: Record<string, number> = {};
  students.forEach((s) => {
    const prov = s.province || 'ไม่ระบุ';
    provinceCounts[prov] = (provinceCounts[prov] || 0) + 1;
  });
  const topProvinces = Object.entries(provinceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Breakdown by Academic Year
  const yearCounts: Record<number, number> = {};
  students.forEach((s) => {
    if (s.academicYear) {
      yearCounts[s.academicYear] = (yearCounts[s.academicYear] || 0) + 1;
    }
  });
  const sortedYears = Object.entries(yearCounts).sort((a, b) => Number(a[0]) - Number(b[0]));
  const maxYearCount = Math.max(...Object.values(yearCounts), 1);

  const statusColors: Record<string, { bg: string; text: string; fill: string }> = {
    กำลังศึกษา: { bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', fill: '#10b981' },
    สำเร็จการศึกษา: { bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', fill: '#f59e0b' },
    พักการเรียน: { bg: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400', fill: '#3b82f6' },
    รักษาสถานภาพ: { bg: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-400', fill: '#a855f7' },
    'พ้นสภาพการเป็นนักศึกษา': { bg: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-400', fill: '#f43f5e' },
  };

  const handleExportChartPng = () => {
    if (!chartContainerRef.current) return;
    const svgElement = chartContainerRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 800;
    canvas.height = 400;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const a = document.createElement('a');
        a.download = `STOU_Lampang_Chart_${new Date().toISOString().slice(0, 10)}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Editorial Header - Customized specifically for มสธ. ลำปาง */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            แดชบอร์ดสารสนเทศนักศึกษา มสธ. ลำปาง
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300 mt-1 font-medium">
            <span className="text-[#0c4a34] dark:text-emerald-400 font-semibold">ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง</span>
            <span aria-hidden="true">·</span>
            <span>นักศึกษาในระบบ {totalStudents} คน</span>
            <span aria-hidden="true">·</span>
            <span>อัปเดตเรียลไทม์</span>
          </div>
        </div>

        {/* Action buttons (Green primary button & Clean white export buttons) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Camera OCR Button (Primary Green with Gold Accent) */}
          <button
            onClick={onOpenAIScan}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#0c4a34] hover:bg-emerald-800 active:bg-emerald-950 border border-amber-400/60 rounded-xl shadow-xs transition min-h-[40px] focus:ring-2 focus:ring-amber-400"
            title="ถ่ายภาพหรือส่งรูปเอกสารให้ AI อ่านและบันทึกอัตโนมัติ"
          >
            <Camera className="w-4 h-4 text-emerald-200" />
            <span className="hidden sm:inline">ถ่ายภาพ AI สแกน</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition shadow-2xs min-h-[40px]"
            title="ดาวน์โหลดข้อมูลเป็นไฟล์ Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Excel</span>
          </button>

          <button
            onClick={onOpenPrintReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition shadow-2xs min-h-[40px]"
            title="พิมพ์หรือบันทึกเป็น PDF"
          >
            <Printer className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span>พิมพ์ / PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards (Pure White Cards on Light Gray) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div
          onClick={() => onNavigateToList()}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xs hover:border-[#0c4a34] dark:hover:border-emerald-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              นักศึกษา มสธ. ลำปาง
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0c4a34] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#0c4a34] dark:text-emerald-400">
              {totalStudents}
            </span>
            <span className="text-xs text-neutral-500">คน</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500 flex items-center gap-1 group-hover:text-emerald-700 transition-colors">
            <span>ดูรายชื่อทั้งหมด</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        {/* Card 2: Active */}
        <div
          onClick={() => onNavigateToList({ status: 'กำลังศึกษา' })}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xs hover:border-[#0c4a34] dark:hover:border-emerald-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              กำลังศึกษาอยู่
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0c4a34] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#0c4a34] dark:text-emerald-400">
              {activeStudents}
            </span>
            <span className="text-xs text-neutral-500">
              ({totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500 flex items-center gap-1 group-hover:text-emerald-700 transition-colors">
            <span>กรองสถานะกำลังศึกษา</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        {/* Card 3: Graduated (Gold Accent Card) */}
        <div
          onClick={() => onNavigateToList({ status: 'สำเร็จการศึกษา' })}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-700/60 shadow-2xs hover:border-amber-500 transition cursor-pointer group ring-1 ring-amber-400/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900 dark:text-amber-300">
              สำเร็จการศึกษา
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300/80 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-700 dark:text-amber-400">
              {graduatedStudents}
            </span>
            <span className="text-xs text-neutral-500">
              ({totalStudents > 0 ? Math.round((graduatedStudents / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1 group-hover:text-amber-800 transition-colors">
            <span>ดูบัณฑิตที่จบการศึกษา</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        {/* Card 4: On Leave / Other */}
        <div
          onClick={() => onNavigateToList({ status: 'พักการเรียน' })}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xs hover:border-blue-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              พักการเรียน / รักษาสภาพ
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-blue-700 dark:text-blue-400">
              {leaveStudents}
            </span>
            <span className="text-xs text-neutral-500">คน</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
            <span>ตรวจสอบการติดตาม</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Main Charts Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" ref={chartContainerRef}>
        {/* Left Column (7 cols): Horizontal Bar Chart by Faculty */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">
                สถิตินักศึกษาแยกตามสาขาวิชา (มสธ. ลำปาง)
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                คลิกที่แท่งเพื่อกรองรายชื่อตามสาขาวิชาทันที
              </p>
            </div>
            <button
              onClick={handleExportChartPng}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="บันทึกกราฟเป็นภาพ PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ภาพ PNG</span>
            </button>
          </div>

          {/* Bar List */}
          <div className="space-y-3 mt-4">
            {facultyList.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">ยังไม่มีข้อมูลนักศึกษาในระบบ</p>
            ) : (
              facultyList.map(([faculty, count]) => {
                const percentage = Math.round((count / (totalStudents || 1)) * 100);
                const barWidth = Math.max(8, (count / maxFacultyCount) * 100);

                return (
                  <div
                    key={faculty}
                    onClick={() => onNavigateToList({ faculty })}
                    className="group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate max-w-[280px] sm:max-w-[360px]">
                        {faculty}
                      </span>
                      <div className="flex items-center gap-2 text-neutral-500 shrink-0 font-mono tabular-nums">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{count} คน</span>
                        <span className="text-[11px] text-neutral-400">({percentage}%)</span>
                      </div>
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-700 dark:bg-emerald-500 h-full rounded-full transition-all duration-500 group-hover:bg-emerald-600"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Status Distribution & Provinces */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Donut Chart & Breakdown */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-2xs">
            <h2 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              สัดส่วนสถานภาพนักศึกษา
            </h2>

            {/* Circular representation / SVG */}
            <div className="flex items-center justify-center py-2">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="12" className="dark:stroke-neutral-800" />
                {(() => {
                  let accumulatedPercent = 0;
                  return Object.entries(statusCounts).map(([status, count]) => {
                    if (count === 0 || totalStudents === 0) return null;
                    const percent = count / totalStudents;
                    const strokeDasharray = `${percent * 251.2} 251.2`;
                    const strokeDashoffset = `-${accumulatedPercent * 251.2}`;
                    accumulatedPercent += percent;
                    const color = statusColors[status]?.fill || '#9ca3af';

                    return (
                      <circle
                        key={status}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={color}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-700"
                      />
                    );
                  });
                })()}
              </svg>
            </div>

            {/* Status Legend */}
            <div className="space-y-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              {Object.entries(statusCounts).map(([status, count]) => {
                if (count === 0) return null;
                const percent = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                return (
                  <button
                    key={status}
                    onClick={() => onNavigateToList({ status })}
                    className="w-full flex items-center justify-between py-1 px-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: statusColors[status]?.fill || '#9ca3af' }}
                      />
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">{status}</span>
                    </div>
                    <span className="font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                      {count} คน ({percent}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regional Distribution by Province */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>การกระจายตัวตามจังหวัด (ศูนย์ฯ ลำปาง)</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {topProvinces.map(([province, count]) => (
                <div
                  key={province}
                  className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-750"
                >
                  <span className="text-xs text-neutral-600 dark:text-neutral-400 block truncate font-medium">
                    {province}
                  </span>
                  <span className="text-base font-bold font-mono tabular-nums text-emerald-800 dark:text-emerald-400">
                    {count} <span className="text-xs font-normal text-neutral-500">คน</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment by Academic Year Chart */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>จำนวนนักศึกษาตามปีการศึกษาที่เข้าศึกษา (พ.ศ.)</span>
            </h2>
            <p className="text-xs text-neutral-500">
              สถิติการรับเข้าศึกษาของศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
          {sortedYears.map(([year, count]) => {
            const heightPercent = Math.max(15, (count / maxYearCount) * 100);
            return (
              <div
                key={year}
                className="flex flex-col items-center gap-2 group cursor-pointer"
                onClick={() => onNavigateToList()}
              >
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {count} คน
                </span>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-28 rounded-xl flex items-end p-1 overflow-hidden">
                  <div
                    className="w-full bg-emerald-600 dark:bg-emerald-500 group-hover:bg-emerald-700 rounded-lg transition-all duration-500"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400">
                  พ.ศ. {year}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Students Table Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">
              รายการนักศึกษาล่าสุดในระบบ
            </h2>
            <p className="text-xs text-neutral-500">
              เข้าถึงข้อมูลและแก้ไขข้อมูลนักศึกษาได้ทันที
            </p>
          </div>
          <button
            onClick={() => onNavigateToList()}
            className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>ดูทั้งหมด ({totalStudents})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/70 text-neutral-600 dark:text-neutral-300 border-y border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap">รหัสนักศึกษา</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap">ชื่อ-นามสกุล</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap">สาขาวิชา</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap">สถานภาพ</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap">เบอร์โทรศัพท์</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {students.slice(0, 5).map((student) => (
                <tr
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                    {formatStudentId(student.studentId)}
                  </td>
                  <td className="py-3 px-3 font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                    {student.title}{student.firstName} {student.lastName}
                  </td>
                  <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap max-w-[200px] truncate">
                    {student.faculty}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`text-[11px] font-medium ${statusColors[student.status]?.text || 'text-neutral-600'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                    {formatPhoneNumber(student.phone)}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStudent(student);
                      }}
                      className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950"
                    >
                      ดูข้อมูล / แก้ไข
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
