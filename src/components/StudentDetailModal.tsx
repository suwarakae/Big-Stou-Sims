import React from 'react';
import { Student } from '../types/student';
import { findRelatedStudentDegrees } from '../utils/studentDuplicateCheck';
import { 
  X, 
  Edit3, 
  Printer, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Building2, 
  Calendar, 
  Award, 
  Copy, 
  Check,
  CreditCard,
  MessageCircle,
  ArrowRight,
  Layers
} from 'lucide-react';
import { formatPhoneNumber, formatStudentId } from '../utils/validation';

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
  allStudents?: Student[];
  onSelectStudent?: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
  onEdit,
  allStudents = [],
  onSelectStudent,
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  if (!isOpen || !student) return null;

  const relatedDegrees = allStudents.length > 0 ? findRelatedStudentDegrees(student, allStudents) : [];

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrintStudentCard = () => {
    window.print();
  };

  const fullAddress = `${student.address} ต.${student.subdistrict || '-'} อ.${student.district || '-'} จ.${student.province} ${student.postalCode}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-850/60 shrink-0">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              ข้อมูลทะเบียนประวัตินักศึกษา มสธ. ลำปาง
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Virtual STOU Student ID Card Mockup */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-900 via-emerald-950 to-neutral-950 text-white shadow-xl relative overflow-hidden border border-emerald-700/50">
            {/* Background watermarks */}
            <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full border-8 border-amber-400/10 pointer-events-none" />
            <div className="absolute right-12 top-4 opacity-15 pointer-events-none">
              <GraduationCap className="w-32 h-32 text-amber-300" />
            </div>

            {/* Top Bar of Student Card */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 font-bold text-lg">
                  มสธ
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-wide text-amber-300">
                    มหาวิทยาลัยสุโขทัยธรรมาธิราช
                  </h4>
                  <p className="text-[10px] tracking-wider text-emerald-200 font-medium">
                    ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง
                  </p>
                </div>
              </div>

              {/* Status Indicator & Multi-Degree Tag */}
              <div className="flex items-center gap-1.5">
                {relatedDegrees.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300">
                    เรียน {relatedDegrees.length + 1} หลักสูตร
                  </span>
                )}
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-800/80 border border-emerald-600 text-emerald-100">
                  {student.status}
                </span>
              </div>
            </div>

            {/* Middle Section: Avatar + Name + Faculty */}
            <div className="mt-5 flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-xl bg-emerald-800/70 border-2 border-amber-300/60 flex items-center justify-center text-amber-200 text-xl font-bold shadow-inner">
                {student.firstName.slice(0, 1)}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {student.title}{student.firstName} {student.lastName}
                </h3>
                <p className="text-xs text-amber-200/90 font-medium">
                  {student.faculty}
                </p>
                <p className="text-[11px] text-emerald-200/70">
                  วิชาเอก: {student.major}
                </p>
              </div>
            </div>

            {/* Bottom Section: ID & Barcode simulation */}
            <div className="mt-5 pt-3 border-t border-emerald-800/70 flex items-end justify-between relative z-10">
              <div>
                <span className="text-[10px] text-emerald-300/80 block uppercase tracking-wider">
                  STUDENT ID / รหัสนักศึกษา
                </span>
                <span className="text-xl font-mono font-bold tracking-widest text-amber-300 tabular-nums">
                  {formatStudentId(student.studentId)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-300/80 block">ปีการศึกษาที่เข้า</span>
                <span className="text-xs font-mono font-semibold text-white">
                  พ.ศ. {student.academicYear} (ภาค {student.entrySemester})
                </span>
              </div>
            </div>
          </div>

          {/* ประวัติการเรียนหลักสูตรอื่น (กรณี น.ศ. เรียนหลายใบ) */}
          {relatedDegrees.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-emerald-50/40 to-amber-50/90 dark:from-amber-950/40 dark:via-neutral-850 dark:to-amber-950/40 border border-amber-300 dark:border-amber-800/80 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <span>นักศึกษาเรียนหลายใบ (มีข้อมูลรวม {relatedDegrees.length + 1} หลักสูตรในระบบ)</span>
                    </h4>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                      คลิกเพื่อดูรายละเอียดหลักสูตรอื่นที่ น.ศ. ท่านนี้เรียนใน มสธ. ลำปาง:
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold text-[10px] shrink-0">
                  เรียน {relatedDegrees.length + 1} ใบ
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {relatedDegrees.map((other) => (
                  <div
                    key={other.id}
                    className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-amber-200/80 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs hover:border-emerald-500 transition"
                  >
                    <div>
                      <div className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                        {other.faculty}
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                        วิชาเอก: {other.major || '-'} · รหัส: {formatStudentId(other.studentId)}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        ปีที่เข้า: พ.ศ. {other.academicYear} · สถานภาพ: {other.status}
                      </div>
                    </div>
                    {onSelectStudent && (
                      <button
                        type="button"
                        onClick={() => onSelectStudent(other)}
                        className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900 transition shrink-0"
                      >
                        <span>เปิดดูหลักสูตรนี้</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Contact & Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <a
              href={`tel:${student.phone}`}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 transition min-h-[44px]"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>โทรออกทันที</span>
            </a>

            <a
              href={`mailto:${student.email}`}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-750 transition min-h-[44px]"
            >
              <Mail className="w-4 h-4 text-neutral-500" />
              <span>ส่งอีเมล</span>
            </a>

            {student.lineId ? (
              <button
                onClick={() => copyToClipboard(student.lineId || '', 'line')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-750 transition min-h-[44px]"
              >
                {copiedField === 'line' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <MessageCircle className="w-4 h-4 text-green-600" />
                )}
                <span>{copiedField === 'line' ? 'คัดลอกแล้ว' : `LINE: ${student.lineId}`}</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center justify-center text-xs text-neutral-400 py-2.5">
                ไม่มีไอดี LINE
              </div>
            )}
          </div>

          {/* Detail Breakdown Tables */}
          <div className="space-y-4 text-xs">
            {/* Academic Detail Section */}
            <div className="bg-neutral-50 dark:bg-neutral-850 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 text-xs">
                <GraduationCap className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>ข้อมูลด้านการศึกษาและการสังกัด</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-neutral-500 block text-[11px]">สาขาวิชา:</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {student.faculty}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">แขนงวิชา / วิชาเอก:</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {student.major}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">ศูนย์วิทยบริการและชุมชนสัมพันธ์:</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {student.stouCenter}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">ปีการศึกษาที่เข้าศึกษา:</span>
                  <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">
                    {student.academicYear ? `พ.ศ. ${student.academicYear} (ภาค ${student.entrySemester || 1})` : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Address & Shipping Section */}
            <div className="bg-neutral-50 dark:bg-neutral-850 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>ที่อยู่จัดส่งเอกสารและตำราเรียน</span>
                </h4>
                <button
                  onClick={() => copyToClipboard(fullAddress, 'address')}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  {copiedField === 'address' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'address' ? 'คัดลอกแล้ว' : 'คัดลอกที่อยู่'}</span>
                </button>
              </div>

              <p className="text-neutral-700 dark:text-neutral-300 pt-1 leading-relaxed">
                {fullAddress}
              </p>
            </div>

            {/* Notes Section */}
            {student.notes && (
              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200/70 dark:border-neutral-800">
                <span className="text-neutral-500 block text-[11px] font-medium">หมายเหตุเพิ่มเติม:</span>
                <p className="text-neutral-700 dark:text-neutral-300 mt-0.5">{student.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-850/60 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handlePrintStudentCard}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 transition min-h-[40px]"
          >
            <Printer className="w-4 h-4 text-neutral-500" />
            <span>พิมพ์บัตร/ประวัติ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition min-h-[40px]"
            >
              ปิด
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0c4a34] hover:bg-emerald-800 active:bg-emerald-950 border border-amber-400/70 rounded-xl shadow-sm transition min-h-[40px] focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>แก้ไขข้อมูลทันที</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
