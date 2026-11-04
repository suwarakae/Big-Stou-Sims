import React from 'react';
import { Student } from '../types/student';
import { Printer, X, Download, ArrowLeft, GraduationCap } from 'lucide-react';
import { formatPhoneNumber, formatStudentId } from '../utils/validation';

interface PrintReportViewProps {
  students: Student[];
  onClose: () => void;
  onExportExcel: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  students,
  onClose,
  onExportExcel,
}) => {
  const printDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate statistics
  const total = students.length;
  const activeCount = students.filter((s) => s.status === 'กำลังศึกษา').length;
  const graduatedCount = students.filter((s) => s.status === 'สำเร็จการศึกษา').length;
  const leaveCount = students.filter(
    (s) => s.status === 'พักการเรียน' || s.status === 'รักษาสถานภาพ'
  ).length;

  const facultyCounts: Record<string, number> = {};
  students.forEach((s) => {
    facultyCounts[s.faculty] = (facultyCounts[s.faculty] || 0) + 1;
  });
  const facultySummary = Object.entries(facultyCounts).sort((a, b) => b[1] - a[1]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 py-6 px-4">
      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-md flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าหลัก</span>
          </button>
          <span className="text-xs text-neutral-400 hidden sm:inline">|</span>
          <span className="text-xs text-neutral-500 hidden sm:inline">
            แสดงตัวอย่างรายงานขนาด A4 สำหรับสั่งพิมพ์หรือบันทึกเป็น PDF
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-xl hover:bg-neutral-200 transition min-h-[40px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl shadow-sm transition min-h-[40px]"
          >
            <Printer className="w-4 h-4" />
            <span>สั่งพิมพ์ / บันทึกเป็น PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 dimensions in print) */}
      <div className="max-w-4xl mx-auto bg-white text-neutral-900 p-8 sm:p-12 rounded-3xl shadow-lg border border-neutral-200 print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Official Header */}
        <div className="text-center pb-6 border-b-2 border-emerald-900">
          <div className="w-14 h-14 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center mx-auto mb-2 text-xl font-bold">
            มสธ
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            มหาวิทยาลัยสุโขทัยธรรมาธิราช
          </h1>
          <p className="text-sm font-semibold text-emerald-900 mt-0.5">
            ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง
          </p>
          <p className="text-xs tracking-wider text-neutral-600 mt-0.5">
            ระบบบันทึกสารสนเทศนักศึกษา มสธ. ลำปาง (STOU Lampang SIMS)
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-neutral-500 mt-2">
            <span>พิมพ์เมื่อวันที่: <strong>{printDate}</strong></span>
            <span>·</span>
            <span>สถานะ: ข้อมูลปัจจุบันในระบบ</span>
          </div>
        </div>

        {/* Executive Summary Metrics Box */}
        <div className="my-6 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
            สรุปภาพรวมสถิตินักศึกษา (Executive Summary)
          </h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-2 border-r border-neutral-200">
              <span className="text-[11px] text-neutral-500 block">นักศึกษาทั้งหมด</span>
              <span className="text-xl font-bold font-mono text-emerald-800">{total}</span>
              <span className="text-[10px] text-neutral-400 block">คน</span>
            </div>
            <div className="p-2 border-r border-neutral-200">
              <span className="text-[11px] text-neutral-500 block">กำลังศึกษา</span>
              <span className="text-xl font-bold font-mono text-emerald-700">{activeCount}</span>
              <span className="text-[10px] text-neutral-400 block">
                ({total > 0 ? Math.round((activeCount / total) * 100) : 0}%)
              </span>
            </div>
            <div className="p-2 border-r border-neutral-200">
              <span className="text-[11px] text-neutral-500 block">สำเร็จการศึกษา</span>
              <span className="text-xl font-bold font-mono text-amber-700">{graduatedCount}</span>
              <span className="text-[10px] text-neutral-400 block">
                ({total > 0 ? Math.round((graduatedCount / total) * 100) : 0}%)
              </span>
            </div>
            <div className="p-2">
              <span className="text-[11px] text-neutral-500 block">พักการเรียน/อื่นๆ</span>
              <span className="text-xl font-bold font-mono text-blue-700">{leaveCount}</span>
              <span className="text-[10px] text-neutral-400 block">
                ({total > 0 ? Math.round((leaveCount / total) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Summary Table by Faculty */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
            1. ตารางแจกแจงนักศึกษาตามสาขาวิชา
          </h3>
          <table className="w-full text-xs border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100 text-neutral-800 border-b border-neutral-300">
                <th className="py-1.5 px-3 text-center w-12 border-r border-neutral-300">ลำดับ</th>
                <th className="py-1.5 px-3 text-left border-r border-neutral-300">สาขาวิชา</th>
                <th className="py-1.5 px-3 text-right w-28 border-r border-neutral-300">จำนวน (คน)</th>
                <th className="py-1.5 px-3 text-right w-24">ร้อยละ (%)</th>
              </tr>
            </thead>
            <tbody>
              {facultySummary.map(([faculty, count], idx) => (
                <tr key={faculty} className="border-b border-neutral-200">
                  <td className="py-1.5 px-3 text-center border-r border-neutral-200 font-mono">{idx + 1}</td>
                  <td className="py-1.5 px-3 border-r border-neutral-200">{faculty}</td>
                  <td className="py-1.5 px-3 text-right border-r border-neutral-200 font-mono font-medium">{count}</td>
                  <td className="py-1.5 px-3 text-right font-mono text-neutral-600">
                    {((count / (total || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-neutral-50 font-bold border-t border-neutral-300">
                <td colSpan={2} className="py-2 px-3 text-center border-r border-neutral-300">รวมทั้งหมด</td>
                <td className="py-2 px-3 text-right border-r border-neutral-300 font-mono">{total}</td>
                <td className="py-2 px-3 text-right font-mono">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Full Student Roster Table */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
            2. บัญชีรายชื่อนักศึกษาในระบบ
          </h3>
          <table className="w-full text-xs border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100 text-neutral-800 border-b border-neutral-300">
                <th className="py-2 px-2 text-center w-10 border-r border-neutral-300">ลำดับ</th>
                <th className="py-2 px-2 text-left w-28 border-r border-neutral-300">รหัสนักศึกษา</th>
                <th className="py-2 px-3 text-left border-r border-neutral-300">ชื่อ-นามสกุล</th>
                <th className="py-2 px-3 text-left border-r border-neutral-300">สาขาวิชา</th>
                <th className="py-2 px-2 text-left w-20 border-r border-neutral-300">สถานภาพ</th>
                <th className="py-2 px-2 text-left w-24 border-r border-neutral-300">เบอร์โทรศัพท์</th>
                <th className="py-2 px-2 text-left w-20">จังหวัด</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={student.id} className="border-b border-neutral-200 text-[11px]">
                  <td className="py-1.5 px-2 text-center border-r border-neutral-200 font-mono">{idx + 1}</td>
                  <td className="py-1.5 px-2 text-left border-r border-neutral-200 font-mono font-medium whitespace-nowrap">
                    {formatStudentId(student.studentId)}
                  </td>
                  <td className="py-1.5 px-3 border-r border-neutral-200 whitespace-nowrap">
                    {student.title}{student.firstName} {student.lastName}
                  </td>
                  <td className="py-1.5 px-3 border-r border-neutral-200 truncate max-w-[180px]">
                    {student.faculty}
                  </td>
                  <td className="py-1.5 px-2 border-r border-neutral-200 whitespace-nowrap">
                    {student.status}
                  </td>
                  <td className="py-1.5 px-2 border-r border-neutral-200 font-mono whitespace-nowrap">
                    {formatPhoneNumber(student.phone)}
                  </td>
                  <td className="py-1.5 px-2 whitespace-nowrap">{student.province}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature Box - ผู้จัดทำรายงาน (ไม่ใส่ตำแหน่ง และ นำนายทะเบียน/ผู้รับรอง ออกตามคำขอ) */}
        <div className="mt-12 pt-6 border-t border-neutral-300 flex justify-end text-center text-xs">
          <div className="w-80">
            <p className="text-neutral-600 mb-14">ลงชื่อ.............................................................. ผู้จัดทำรายงาน</p>
            <p className="font-medium text-neutral-800">(..............................................................)</p>
            <p className="text-neutral-500 mt-2">วันที่........เดือน.........................พ.ศ.............</p>
          </div>
        </div>
      </div>
    </div>
  );
};
