/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, DEFAULT_STOU_CENTER } from './types/student';
import { INITIAL_STUDENTS } from './data/initialStudents';
import { exportStudentsToExcel } from './utils/exportExcel';
import { formatStudentId } from './utils/validation';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { StudentFormModal } from './components/StudentFormModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StudentAIScanModal } from './components/StudentAIScanModal';
import { StudentBarcodeScannerModal } from './components/StudentBarcodeScannerModal';
import { PrintReportView } from './components/PrintReportView';
import { PWAInstallModal } from './components/PWAInstallModal';
import { CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'stou_lampang_sims_records_v1';
const THEME_KEY = 'stou_theme_dark';

export default function App() {
  // 1. Data state with LocalStorage persistence
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load students from localStorage', e);
    }
    // Update initial students stouCenter to STOU Lampang
    return INITIAL_STUDENTS.map((s) => ({
      ...s,
      stouCenter: DEFAULT_STOU_CENTER,
    }));
  });

  // Save to LocalStorage whenever students changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students to localStorage', e);
    }
  }, [students]);

  // 2. Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'list' | 'report'>('dashboard');
  const [filterPreset, setFilterPreset] = useState<{ faculty?: string; status?: string }>({});

  // 3. Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, String(isDarkMode));
  }, [isDarkMode]);

  // 4. Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAIScanModalOpen, setIsAIScanModalOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // PWA Install hook
  const { isInstallable, isInstalled, isIOS, install: installPWA } = usePWAInstall();

  // Handlers
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsFormModalOpen(true);
  };

  const handleOpenAIScan = () => {
    setIsAIScanModalOpen(true);
  };

  const handleOpenBarcodeScan = () => {
    setIsBarcodeScannerOpen(true);
  };

  const handleBarcodeScanSuccess = (scannedId: string) => {
    const cleanScanned = scannedId.replace(/\D/g, '');
    const found = students.find((s) => s.studentId.replace(/\D/g, '') === cleanScanned);

    if (found) {
      setSelectedStudent(found);
      showToast(`พบบาร์โค้ดนักศึกษา ${found.title}${found.firstName} ${found.lastName} ในระบบ`);
    } else {
      // Pre-populate student ID into form for immediate saving
      if (isFormModalOpen && editingStudent) {
        setEditingStudent({
          ...editingStudent,
          studentId: scannedId,
        });
      } else {
        setEditingStudent({
          studentId: scannedId,
          title: 'นาย',
          firstName: '',
          lastName: '',
          faculty: 'สาขาวิชาวิทยาการจัดการ',
          stouCenter: DEFAULT_STOU_CENTER,
          academicYear: 2567,
          province: 'ลำปาง',
          status: 'กำลังศึกษา',
        } as Student);
        setIsFormModalOpen(true);
      }
      showToast(`สแกนบาร์โค้ดรหัส ${formatStudentId(scannedId)} สำเร็จ พร้อมบันทึก`);
    }
  };

  const handleApplyAIScanData = (extracted: Partial<Student>) => {
    setEditingStudent(extracted as Student);
    setIsFormModalOpen(true);
    showToast('AI นำเข้าข้อมูลเอกสารสำเร็จ กรุณาตรวจสอบและบันทึก');
  };

  const handleSaveStudent = (data: Partial<Student>) => {
    const now = new Date().toISOString();

    if (editingStudent && editingStudent.id) {
      // Update existing
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id
            ? ({
                ...s,
                ...data,
                stouCenter: DEFAULT_STOU_CENTER,
                updatedAt: now,
              } as Student)
            : s
        )
      );
      showToast(`แก้ไขข้อมูลนักศึกษา ${data.firstName} ${data.lastName} สำเร็จ`);
    } else {
      // Add new
      const newStudent: Student = {
        id: `stou-${Date.now()}`,
        studentId: data.studentId || '',
        title: data.title || 'นาย',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        faculty: data.faculty || 'สาขาวิชาวิทยาการจัดการ',
        major: data.major || '',
        stouCenter: DEFAULT_STOU_CENTER,
        academicYear: data.academicYear || 2567,
        entrySemester: data.entrySemester || 1,
        phone: data.phone || '',
        email: data.email || '',
        lineId: data.lineId || '',
        address: data.address || '',
        subdistrict: data.subdistrict || '',
        district: data.district || '',
        province: data.province || 'ลำปาง',
        postalCode: data.postalCode || '52000',
        status: data.status || 'กำลังศึกษา',
        createdAt: now,
        updatedAt: now,
        notes: data.notes || '',
      };
      setStudents((prev) => [newStudent, ...prev]);
      showToast(`บันทึกข้อมูลนักศึกษา ${newStudent.firstName} เรียบร้อยแล้ว`);
    }

    setIsFormModalOpen(false);
    setEditingStudent(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    showToast(`ลบข้อมูล ${deleteTarget.name} แล้ว`);
    setDeleteTarget(null);
    if (selectedStudent?.id === deleteTarget.id) {
      setSelectedStudent(null);
    }
  };

  const handleResetData = () => {
    const updated = INITIAL_STUDENTS.map((s) => ({
      ...s,
      stouCenter: DEFAULT_STOU_CENTER,
    }));
    setStudents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setShowResetConfirm(false);
    showToast('รีเซ็ตข้อมูลตัวอย่างนักศึกษา มสธ. ลำปาง เรียบร้อยแล้ว');
  };

  const handleExportExcel = () => {
    exportStudentsToExcel(students, 'STOU_Lampang_Students');
    showToast('ดาวน์โหลดไฟล์ Excel เรียบร้อยแล้ว');
  };

  const handleNavigateToList = (filter?: { faculty?: string; status?: string }) => {
    if (filter) {
      setFilterPreset(filter);
    } else {
      setFilterPreset({});
    }
    setCurrentTab('list');
  };

  // If in Print Report View mode, render dedicated report page
  if (currentTab === 'report') {
    return (
      <PrintReportView
        students={students}
        onClose={() => setCurrentTab('dashboard')}
        onExportExcel={handleExportExcel}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors pb-24 md:pb-8">
      {/* Top Bar / Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAddModal={handleOpenAddModal}
        onOpenAIScan={handleOpenAIScan}
        onOpenBarcodeScan={handleOpenBarcodeScan}
        onExportExcel={handleExportExcel}
        onOpenPrintReport={() => setCurrentTab('report')}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isInstallable={isInstallable}
        onInstallPWA={installPWA}
        isIOS={isIOS}
        onOpenIOSGuide={() => setShowIOSGuide(true)}
        isInstalled={isInstalled}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'dashboard' ? (
          <Dashboard
            students={students}
            onSelectStudent={(s) => setSelectedStudent(s)}
            onNavigateToList={handleNavigateToList}
            onExportExcel={handleExportExcel}
            onOpenPrintReport={() => setCurrentTab('report')}
            onOpenAddModal={handleOpenAddModal}
            onOpenAIScan={handleOpenAIScan}
          />
        ) : (
          <StudentList
            students={students}
            onSelectStudent={(s) => setSelectedStudent(s)}
            onEditStudent={handleEditStudent}
            onDeleteStudent={(id, name) => setDeleteTarget({ id, name })}
            onOpenAddModal={handleOpenAddModal}
            onExportExcel={handleExportExcel}
            onOpenAIScan={handleOpenAIScan}
            onOpenBarcodeScan={handleOpenBarcodeScan}
            initialFacultyFilter={filterPreset.faculty || ''}
            initialStatusFilter={filterPreset.status || ''}
          />
        )}
      </main>

      {/* Footer - White Card with Green/Gold Accent */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 px-4 text-xs no-print mt-auto bg-white dark:bg-neutral-900 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          {/* Section 1: ชื่อระบบแก้ไขเป็น STOU Lampang SIMS */}
          <div className="space-y-1">
            <h4 className="font-bold text-base tracking-wide text-[#0c4a34] dark:text-emerald-400">
              STOU Lampang SIMS
            </h4>
            <div className="flex items-center justify-center md:justify-start gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง</span>
              <span aria-hidden="true">·</span>
              <span>มหาวิทยาลัยสุโขทัยธรรมาธิราช</span>
            </div>
          </div>

          {/* Section 2: ข้อมูลผู้พัฒนาระบบ (สุพจน์ สระทองพูน (Supot Sathongpoon)) with Gold Accent */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-700/60 text-[11px] text-neutral-800 dark:text-neutral-200 shadow-2xs">
              <span className="text-amber-800 dark:text-amber-400 font-medium mr-1.5">ผู้พัฒนาระบบ:</span>
              <strong className="text-[#0c4a34] dark:text-emerald-300 font-bold">สุพจน์ สระทองพูน (Supot Sathongpoon)</strong>
            </div>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-[11px] text-neutral-500 hover:text-emerald-800 dark:hover:text-emerald-400 flex items-center gap-1 py-1 cursor-pointer transition-colors"
              title="โหลดข้อมูลตัวอย่างนักศึกษา มสธ. ลำปาง ใหม่"
            >
              <RotateCcw className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>รีเซ็ตข้อมูลตัวอย่าง</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAddModal={handleOpenAddModal}
        onOpenAIScan={handleOpenAIScan}
        onOpenPrintReport={() => setCurrentTab('report')}
        studentCount={students.length}
      />

      {/* Student Form Modal (Add / Edit) with Barcode & AI Scanner */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        initialData={editingStudent}
        existingStudents={students}
        onOpenAIScan={handleOpenAIScan}
        onOpenBarcodeScan={handleOpenBarcodeScan}
        onViewStudent={(student) => {
          setIsFormModalOpen(false);
          setSelectedStudent(student);
        }}
      />

      {/* Student Barcode Scanner Modal (Camera / Image) */}
      <StudentBarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onScanSuccess={handleBarcodeScanSuccess}
      />

      {/* AI Camera OCR Modal */}
      <StudentAIScanModal
        isOpen={isAIScanModalOpen}
        onClose={() => setIsAIScanModalOpen(false)}
        onApplyData={handleApplyAIScanData}
      />

      {/* Student Detail Card Modal */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        onEdit={(student) => {
          handleEditStudent(student);
        }}
        allStudents={students}
        onSelectStudent={(student) => {
          setSelectedStudent(student);
        }}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              ยืนยันการลบข้อมูลนักศึกษา
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
              คุณต้องการลบข้อมูลของ <strong>{deleteTarget.name}</strong> ออกจากระบบใช่หรือไม่?
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition min-h-[40px]"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition min-h-[40px]"
              >
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Data Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              รีเซ็ตข้อมูลกลับสู่ค่าเริ่มต้น
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
              ระบบจะโหลดข้อมูลตัวอย่างนักศึกษา มสธ. ลำปาง ทั้ง 14 รายการกลับมาแทนที่ข้อมูลปัจจุบัน
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition min-h-[40px]"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition min-h-[40px]"
              >
                ยืนยันการรีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS PWA Install Modal */}
      <PWAInstallModal
        isOpen={showIOSGuide}
        onClose={() => setShowIOSGuide(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
