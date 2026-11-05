import React, { useState, useEffect } from 'react';
import { 
  Student, 
  STOU_FACULTIES, 
  STOU_MAJORS_BY_FACULTY, 
  DEFAULT_STOU_CENTER, 
  STUDENT_STATUSES, 
  THAI_PROVINCES,
  StudentStatus 
} from '../types/student';
import { validateStudent, formatStudentId } from '../utils/validation';
import { checkStudentDuplicates } from '../utils/studentDuplicateCheck';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  User, 
  GraduationCap, 
  MapPin, 
  Phone, 
  Hash, 
  Camera, 
  Sparkles,
  ScanBarcode,
  Layers,
  ArrowRight
} from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Partial<Student>) => void;
  initialData?: Student | null;
  existingStudents: Student[];
  onOpenAIScan?: () => void;
  onOpenBarcodeScan?: () => void;
  onViewStudent?: (student: Student) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingStudents,
  onOpenAIScan,
  onOpenBarcodeScan,
  onViewStudent,
}) => {
  const isEditing = Boolean(initialData && initialData.id);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    studentId: '',
    title: 'นาย',
    firstName: '',
    lastName: '',
    faculty: STOU_FACULTIES[0],
    major: STOU_MAJORS_BY_FACULTY[STOU_FACULTIES[0]][0],
    stouCenter: DEFAULT_STOU_CENTER,
    academicYear: 2567,
    entrySemester: 1,
    phone: '',
    email: '',
    lineId: '',
    address: '',
    subdistrict: '',
    district: '',
    province: 'ลำปาง',
    postalCode: '52000',
    status: 'กำลังศึกษา',
    gpa: 3.0,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        stouCenter: DEFAULT_STOU_CENTER,
      });
    } else {
      setFormData({
        studentId: '',
        title: 'นาย',
        firstName: '',
        lastName: '',
        faculty: STOU_FACULTIES[0],
        major: STOU_MAJORS_BY_FACULTY[STOU_FACULTIES[0]][0],
        stouCenter: DEFAULT_STOU_CENTER,
        academicYear: 2567,
        entrySemester: 1,
        phone: '',
        email: '',
        lineId: '',
        address: '',
        subdistrict: '',
        district: '',
        province: 'ลำปาง',
        postalCode: '52000',
        status: 'กำลังศึกษา',
        gpa: 3.0,
        notes: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [initialData, isOpen]);

  const handleFacultyChange = (facultyName: string) => {
    const majors = STOU_MAJORS_BY_FACULTY[facultyName] || [];
    setFormData((prev) => ({
      ...prev,
      faculty: facultyName,
      major: majors[0] || '',
    }));
  };

  const handleFieldChange = (field: keyof Student, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    const updated = { ...formData, [field]: value };
    const { errors: newErrors } = validateStudent(updated, existingStudents, initialData?.id);
    setErrors(newErrors);
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const { errors: newErrors } = validateStudent(formData, existingStudents, initialData?.id);
    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateStudent(
      formData,
      existingStudents,
      initialData?.id
    );

    if (!isValid) {
      setErrors(validationErrors);
      const allTouched: Record<string, boolean> = {};
      Object.keys(validationErrors).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }

    onSave({
      ...formData,
      stouCenter: DEFAULT_STOU_CENTER,
    });
    onClose();
  };

  if (!isOpen) return null;

  const currentMajors = STOU_MAJORS_BY_FACULTY[formData.faculty || ''] || [];
  const rawIdLength = (formData.studentId || '').replace(/\D/g, '').length;
  const dupResult = checkStudentDuplicates(formData, existingStudents, initialData?.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-850/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {isEditing ? 'แก้ไขข้อมูลนักศึกษา มสธ. ลำปาง' : 'บันทึกข้อมูลนักศึกษาใหม่ มสธ. ลำปาง'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Quick AI Camera OCR Trigger Banner */}
          {onOpenAIScan && (
            <div
              onClick={onOpenAIScan}
              className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-md transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-amber-300 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <span>ถ่ายรูปบัตรนักศึกษา มสธ. สแกนกรอกให้อัตโนมัติ</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </h4>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400">
                    ไม่อยากพิมพ์เอง? ถ่ายภาพบัตรประจำตัวนักศึกษา มสธ. ระบบจะอ่านรหัส ชื่อ-สกุล สาขาวิชา และกรอกลงฟอร์มให้อัตโนมัติทันที
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-white bg-[#0c4a34] px-3.5 py-1.5 rounded-lg border border-amber-400/80 shadow-xs shrink-0">
                ถ่ายบัตรเลย
              </span>
            </div>
          )}

          {/* 1. แจ้งเตือน: บันทึกข้อมูลซ้ำกัน (Duplicate Entry) */}
          {dupResult.isDuplicateEntry && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-2xl flex flex-col gap-2.5 text-xs text-rose-900 dark:text-rose-200 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>แจ้งเตือน: ตรวจพบข้อมูลซ้ำจากการบันทึกซ้ำซ้อน (Duplicate Entry)</span>
              </div>
              <p className="leading-relaxed">
                {dupResult.errorMessage}
              </p>
              {dupResult.duplicateStudent && onViewStudent && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onViewStudent(dupResult.duplicateStudent!)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 dark:text-rose-200 bg-white dark:bg-neutral-800 border border-rose-300 dark:border-rose-700 rounded-xl hover:bg-rose-100 dark:hover:bg-neutral-700 transition shadow-2xs"
                  >
                    <span>คลิกเพื่อดูข้อมูลนักศึกษาเดิม</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. แจ้งเตือน: ข้อมูลซ้ำ โปรดตรวจสอบ (Multi-Degree Student) */}
          {dupResult.isMultiDegree && (
            <div className="p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex flex-col gap-2.5 text-xs text-amber-950 dark:text-amber-200 animate-in fade-in">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
                  <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>แจ้งเตือน: ข้อมูลซ้ำ โปรดตรวจสอบ</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold text-[10px]">
                  มี {dupResult.multiDegreeStudents.length} หลักสูตรเดิม
                </span>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-[11px]">
                นักศึกษาท่านนี้มีประวัติลงทะเบียนเรียนในหลักสูตรอื่นของ มสธ. ลำปาง อยู่แล้ว <strong>สามารถบันทึกเพิ่มเป็นหลักสูตรใหม่ได้ตามปกติ</strong> หรือคลิกเพื่อตรวจสอบข้อมูลหลักสูตรเดิมได้ด้านล่าง:
              </p>
              <div className="space-y-2 pt-1">
                {dupResult.multiDegreeStudents.map((other) => (
                  <div
                    key={other.id}
                    className="p-3 rounded-xl bg-white dark:bg-neutral-850 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-emerald-800 dark:text-emerald-300">
                        {other.faculty}
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                        วิชาเอก: {other.major || '-'} · รหัส: {formatStudentId(other.studentId)} · ปีที่เข้า: พ.ศ. {other.academicYear} ({other.status})
                      </div>
                    </div>
                    {onViewStudent && (
                      <button
                        type="button"
                        onClick={() => onViewStudent(other)}
                        className="self-start sm:self-auto inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900 transition shrink-0"
                      >
                        <span>เปิดดูหลักสูตรนี้</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Error Alert if any touched errors */}
          {Object.keys(errors).length > 0 && Object.keys(touched).some((k) => errors[k]) && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">พบข้อมูลที่ควรแก้ไข:</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {Object.entries(errors)
                    .filter(([field]) => touched[field])
                    .map(([field, msg]) => (
                      <li key={field}>{msg}</li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          {/* Section 1: ข้อมูลนักศึกษาและรหัส มสธ. */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              <span>รหัสนักศึกษาและสถานภาพ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* รหัสนักศึกษา (10 หลัก) */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    รหัสนักศึกษา (10 หลัก)
                  </label>
                  <div className="flex items-center gap-2">
                    {onOpenBarcodeScan && (
                      <button
                        type="button"
                        onClick={onOpenBarcodeScan}
                        className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-lg flex items-center gap-1 transition"
                        title="เปิดกล้องสแกนบาร์โค้ดบนบัตรนักศึกษา"
                      >
                        <ScanBarcode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>สแกนบาร์โค้ดบัตร</span>
                      </button>
                    )}
                    <span className={`text-[11px] font-mono tabular-nums ${rawIdLength === 10 ? 'text-emerald-600' : 'text-neutral-400'}`}>
                      {rawIdLength}/10 หลัก
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.studentId || ''}
                    onChange={(e) => handleFieldChange('studentId', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleBlur('studentId')}
                    placeholder="เช่น 6630014521"
                    className={`w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border rounded-xl text-sm font-mono tracking-wider text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 ${
                      touched.studentId && errors.studentId
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                        : touched.studentId && !errors.studentId && rawIdLength === 10
                        ? 'border-emerald-500 focus:ring-emerald-500'
                        : 'border-neutral-300 dark:border-neutral-700 focus:ring-emerald-600'
                    }`}
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {touched.studentId && !errors.studentId && rawIdLength === 10 && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    {onOpenBarcodeScan && (
                      <button
                        type="button"
                        onClick={onOpenBarcodeScan}
                        className="p-1 text-neutral-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                        title="สแกนบาร์โค้ด"
                      >
                        <ScanBarcode className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {touched.studentId && errors.studentId && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.studentId}</span>
                  </p>
                )}
              </div>

              {/* สถานภาพนักศึกษา (เอาดอกจันทร์ออกตามคำขอ) */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  สถานภาพ
                </label>
                <select
                  value={formData.status || 'กำลังศึกษา'}
                  onChange={(e) => handleFieldChange('status', e.target.value as StudentStatus)}
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {STUDENT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: ข้อมูลส่วนบุคคล */}
          <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>ข้อมูลชื่อ-นามสกุล</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* คำนำหน้า */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  คำนำหน้า
                </label>
                <select
                  value={formData.title || 'นาย'}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="ว่าที่ ร.ต.">ว่าที่ ร.ต.</option>
                  <option value="ดร.">ดร.</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              {/* ชื่อจริง */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  ชื่อจริง <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  onBlur={() => handleBlur('firstName')}
                  placeholder="เช่น กิตติศักดิ์"
                  className={`w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 ${
                    touched.firstName && errors.firstName
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-neutral-300 dark:border-neutral-700 focus:ring-emerald-600'
                  }`}
                />
                {touched.firstName && errors.firstName && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* นามสกุล */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  onBlur={() => handleBlur('lastName')}
                  placeholder="เช่น จงประเสริฐ"
                  className={`w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 ${
                    touched.lastName && errors.lastName
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-neutral-300 dark:border-neutral-700 focus:ring-emerald-600'
                  }`}
                />
                {touched.lastName && errors.lastName && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: สาขาวิชาและหลักสูตร มสธ. */}
          <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>สาขาวิชาและหลักสูตร</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* สาขาวิชา */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  สาขาวิชา (มสธ.)
                </label>
                <select
                  value={formData.faculty || STOU_FACULTIES[0]}
                  onChange={(e) => handleFacultyChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {STOU_FACULTIES.map((fac) => (
                    <option key={fac} value={fac}>
                      {fac}
                    </option>
                  ))}
                </select>
              </div>

              {/* แขนงวิชา / วิชาเอก (เอาดอกจันทร์ออกตามคำขอ) */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  แขนงวิชา / วิชาเอก
                </label>
                <select
                  value={formData.major || ''}
                  onChange={(e) => handleFieldChange('major', e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="">(ไม่ระบุ / ยังไม่เลือก)</option>
                  {currentMajors.map((maj) => (
                    <option key={maj} value={maj}>
                      {maj}
                    </option>
                  ))}
                </select>
              </div>

              {/* ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง (ค่าคงที่) */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  ศูนย์วิทยบริการและชุมชนสัมพันธ์
                </label>
                <input
                  type="text"
                  readOnly
                  value="ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง"
                  className="w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 cursor-not-allowed font-medium"
                />
              </div>

              {/* ปีที่เข้าศึกษา (เอาดอกจันทร์ออกตามคำขอ) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    ปีการศึกษา (พ.ศ.)
                  </label>
                  <input
                    type="number"
                    value={formData.academicYear || 2567}
                    onChange={(e) => handleFieldChange('academicYear', parseInt(e.target.value) || 2567)}
                    min={2540}
                    max={2580}
                    className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    ภาคการศึกษา
                  </label>
                  <select
                    value={formData.entrySemester || 1}
                    onChange={(e) => handleFieldChange('entrySemester', parseInt(e.target.value) as 1 | 2)}
                    className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value={1}>ภาคเรียนที่ 1</option>
                    <option value={2}>ภาคเรียนที่ 2</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: ข้อมูลการติดต่อ (เอาดอกจันทร์ออกจากเบอร์และอีเมลตามคำขอ) */}
          <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>ช่องทางการติดต่อ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Phone (Optional) */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  เบอร์ติดต่อ
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.phone || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value.replace(/\D/g, ''))}
                  onBlur={() => handleBlur('phone')}
                  placeholder="เช่น 0812345678"
                  className={`w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border rounded-xl text-sm font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 ${
                    touched.phone && errors.phone
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-neutral-300 dark:border-neutral-700 focus:ring-emerald-600'
                  }`}
                />
                {touched.phone && errors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="student@stou.ac.th"
                  className={`w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 ${
                    touched.email && errors.email
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-neutral-300 dark:border-neutral-700 focus:ring-emerald-600'
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* LINE ID */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  LINE ID
                </label>
                <input
                  type="text"
                  value={formData.lineId || ''}
                  onChange={(e) => handleFieldChange('lineId', e.target.value)}
                  placeholder="ไอดีไลน์สำหรับติดต่อ"
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 5: ข้อมูลที่อยู่ */}
          <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>ที่อยู่ปัจจุบันสำหรับจัดส่งเอกสารและตำราเรียน</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* ที่อยู่ */}
              <div className="sm:col-span-12">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  บ้านเลขที่ / หมู่ที่ / ถนน / ซอย
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="เช่น 128 หมู่ 3 ถนนพหลโยธิน"
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* ตำบล / แขวง */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  ตำบล / แขวง
                </label>
                <input
                  type="text"
                  value={formData.subdistrict || ''}
                  onChange={(e) => handleFieldChange('subdistrict', e.target.value)}
                  placeholder="พระบาท"
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* อำเภอ / เขต */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  อำเภอ / เขต
                </label>
                <input
                  type="text"
                  value={formData.district || ''}
                  onChange={(e) => handleFieldChange('district', e.target.value)}
                  placeholder="เมืองลำปาง"
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* จังหวัด */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  จังหวัด
                </label>
                <select
                  value={formData.province || 'ลำปาง'}
                  onChange={(e) => handleFieldChange('province', e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {THAI_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              {/* รหัสไปรษณีย์ (5 หลัก) */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  รหัสไปรษณีย์
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={formData.postalCode || ''}
                  onChange={(e) => handleFieldChange('postalCode', e.target.value.replace(/\D/g, ''))}
                  onBlur={() => handleBlur('postalCode')}
                  placeholder="52000"
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                {touched.postalCode && errors.postalCode && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.postalCode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: บันทึกเพิ่มเติม */}
          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              หมายเหตุ / ข้อมูลเพิ่มเติม (เช่น สถานที่ทำงาน, รุ่นการศึกษา, ข้อมูลที่สแกนได้)
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="ระบุรายละเอียดเพิ่มเติม..."
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
            />
          </div>
        </form>

        {/* Modal Footer / Action CTA */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition min-h-[44px]"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0c4a34] hover:bg-emerald-800 active:bg-emerald-950 border border-amber-400/70 rounded-xl shadow-md transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{isEditing ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลนักศึกษา'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
