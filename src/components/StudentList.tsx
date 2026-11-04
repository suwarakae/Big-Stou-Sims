import React, { useState, useMemo } from 'react';
import { 
  Student, 
  STOU_FACULTIES, 
  STUDENT_STATUSES 
} from '../types/student';
import { 
  Search, 
  X, 
  Edit3, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  FileSpreadsheet, 
  UserPlus, 
  LayoutGrid, 
  Table as TableIcon,
  MapPin,
  Camera,
  Sparkles,
  ScanBarcode,
  GraduationCap
} from 'lucide-react';
import { formatPhoneNumber, formatStudentId } from '../utils/validation';
import { findRelatedStudentDegrees } from '../utils/studentDuplicateCheck';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string, name: string) => void;
  onOpenAddModal: () => void;
  onExportExcel: () => void;
  onOpenAIScan: () => void;
  onOpenBarcodeScan?: () => void;
  initialFacultyFilter?: string;
  initialStatusFilter?: string;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onSelectStudent,
  onEditStudent,
  onDeleteStudent,
  onOpenAddModal,
  onExportExcel,
  onOpenAIScan,
  onOpenBarcodeScan,
  initialFacultyFilter = '',
  initialStatusFilter = '',
}) => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(initialFacultyFilter);
  const [selectedStatus, setSelectedStatus] = useState(initialStatusFilter);
  const [selectedYear, setSelectedYear] = useState('');
  const [filterMultiDegreeOnly, setFilterMultiDegreeOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Map each student to other degree records
  const relatedDegreesMap = useMemo(() => {
    const map = new Map<string, Student[]>();
    students.forEach((s) => {
      map.set(s.id, findRelatedStudentDegrees(s, students));
    });
    return map;
  }, [students]);

  const multiDegreeStudentsCount = useMemo(() => {
    return students.filter((s) => (relatedDegreesMap.get(s.id)?.length || 0) > 0).length;
  }, [students, relatedDegreesMap]);

  // Available academic years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(students.map((s) => s.academicYear))).sort(
      (a, b) => b - a
    );
    return years;
  }, [students]);

  // Real-time filtering
  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const queryDigits = query.replace(/\D/g, '');

    return students.filter((s) => {
      // 1. Search Query
      if (query) {
        const fullName = `${s.title}${s.firstName} ${s.lastName}`.toLowerCase();
        const rawId = s.studentId.replace(/\D/g, '');
        const rawPhone = s.phone.replace(/\D/g, '');
        const matchName = fullName.includes(query) || s.firstName.toLowerCase().includes(query) || s.lastName.toLowerCase().includes(query);
        const matchId = rawId.includes(queryDigits || query);
        const matchPhone = rawPhone.includes(queryDigits || query);
        const matchMajor = s.faculty.toLowerCase().includes(query) || s.major.toLowerCase().includes(query);
        const matchProvince = s.province.toLowerCase().includes(query);
        const matchLine = s.lineId ? s.lineId.toLowerCase().includes(query) : false;

        if (!matchName && !matchId && !matchPhone && !matchMajor && !matchProvince && !matchLine) {
          return false;
        }
      }

      // 2. Faculty Filter
      if (selectedFaculty && s.faculty !== selectedFaculty) {
        return false;
      }

      // 3. Status Filter
      if (selectedStatus && s.status !== selectedStatus) {
        return false;
      }

      // 4. Academic Year Filter
      if (selectedYear && s.academicYear.toString() !== selectedYear) {
        return false;
      }

      // 5. Multi-degree Filter
      if (filterMultiDegreeOnly) {
        const related = relatedDegreesMap.get(s.id) || [];
        if (related.length === 0) return false;
      }

      return true;
    });
  }, [students, searchQuery, selectedFaculty, selectedStatus, selectedYear, filterMultiDegreeOnly, relatedDegreesMap]);

  // Status badge styling helper
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'กำลังศึกษา':
        return 'text-emerald-700 dark:text-emerald-400 font-medium';
      case 'สำเร็จการศึกษา':
        return 'text-amber-700 dark:text-amber-400 font-medium';
      case 'พักการเรียน':
        return 'text-blue-700 dark:text-blue-400 font-medium';
      case 'รักษาสถานภาพ':
        return 'text-purple-700 dark:text-purple-400 font-medium';
      default:
        return 'text-rose-700 dark:text-rose-400 font-medium';
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedFaculty || selectedStatus || selectedYear || filterMultiDegreeOnly
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFaculty('');
    setSelectedStatus('');
    setSelectedYear('');
    setFilterMultiDegreeOnly(false);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header & Search Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            ทะเบียนประวัตินักศึกษา มสธ. ลำปาง
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <span>ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง</span>
            <span aria-hidden="true">·</span>
            <span>พบ <strong className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400">{filteredStudents.length}</strong> จาก {students.length} รายการ</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Camera / Photo Scanner Button (Primary Green with Gold Accent) */}
          <button
            onClick={onOpenAIScan}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#0c4a34] hover:bg-emerald-800 active:bg-emerald-950 border border-amber-400/60 rounded-xl shadow-xs transition min-h-[40px] focus:ring-2 focus:ring-amber-400"
            title="ถ่ายภาพหรืออัปโหลดรูปเอกสาร ให้ AI สแกนกรอกข้อมูลให้อัตโนมัติ"
          >
            <Camera className="w-4 h-4 text-emerald-200" />
            <span className="inline text-[11px] sm:text-xs">ถ่ายภาพ/สแกน</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>

          {/* Barcode Scanner Button */}
          {onOpenBarcodeScan && (
            <button
              onClick={onOpenBarcodeScan}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition shadow-2xs min-h-[40px]"
              title="สแกนบาร์โค้ดบัตรนักศึกษา มสธ."
            >
              <ScanBarcode className="w-4 h-4 text-[#0c4a34] dark:text-emerald-400" />
              <span className="hidden sm:inline">สแกนบาร์โค้ด</span>
            </button>
          )}

          {/* View toggle (desktop/tablet) */}
          <div className="hidden sm:flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="มุมมองตาราง"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="มุมมองการ์ด"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-2xs min-h-[40px]"
            title="ส่งออกรายการนี้เป็นไฟล์ Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#0c4a34] dark:text-emerald-400" />
            <span className="hidden sm:inline">ส่งออก</span> Excel
          </button>

          {/* Primary Action Button (Green with Gold Accent) */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0c4a34] hover:bg-emerald-800 active:bg-emerald-950 border border-amber-400/70 rounded-xl shadow-sm transition-all min-h-[40px] focus:ring-2 focus:ring-amber-400"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            <span>เพิ่มนักศึกษา</span>
          </button>
        </div>
      </div>

      {/* Filter and Live Search Controls Container */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs space-y-3">
        {/* Row 1: Search Box + Quick Filter Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, รหัสนักศึกษา 10 หลัก, สาขาวิชา, เบอร์โทรศัพท์, อำเภอ/จังหวัด..."
              className="w-full pl-9 pr-9 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-emerald-500 transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Reset Filters button if any active */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors whitespace-nowrap min-h-[40px] flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>ล้างตัวกรอง</span>
            </button>
          )}
        </div>

        {/* Row 2: Filter Selects (สาขาวิชา, สถานภาพ, ปีที่เข้า - นำศูนย์วิทยบริการออกตามคำขอ) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          {/* สาขาวิชา Filter */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              สาขาวิชา (มสธ.)
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full px-2.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 truncate"
            >
              <option value="">ทุกสาขาวิชา ({STOU_FACULTIES.length})</option>
              {STOU_FACULTIES.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>

          {/* สถานภาพ Filter */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              สถานภาพนักศึกษา
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="">ทุกสถานภาพ</option>
              {STUDENT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* ปีการศึกษา Filter */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              ปีที่เข้าศึกษา (พ.ศ.)
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-2.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
            >
              <option value="">ทุกปีการศึกษา</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr.toString()}>
                  พ.ศ. {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Tag for Multi-Degree Students */}
        {multiDegreeStudentsCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">ตัวกรองพิเศษ:</span>
              <button
                type="button"
                onClick={() => setFilterMultiDegreeOnly(!filterMultiDegreeOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  filterMultiDegreeOnly
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                <span>น.ศ. เรียนหลายใบ ({multiDegreeStudentsCount} รายการ)</span>
              </button>
            </div>

            {filterMultiDegreeOnly && (
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                กำลังแสดงเฉพาะนักศึกษาที่มีประวัติการศึกษามากกว่า 1 หลักสูตรใน มสธ. ลำปาง
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Student Results View */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            ไม่พบข้อมูลนักศึกษาที่ตรงกับเงื่อนไข
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่มล้างตัวกรองเพื่อแสดงข้อมูลทั้งหมด
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 transition"
            >
              ล้างตัวกรองทั้งหมด
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 dark:bg-emerald-600 rounded-lg hover:bg-emerald-800 transition"
            >
              + บันทึกนักศึกษาใหม่
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap">รหัสนักศึกษา</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap">สาขาวิชา / วิชาเอก</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap">สถานภาพ</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap">จังหวัด</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap">เบอร์โทรศัพท์</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap">ปีที่เข้า</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => onSelectStudent(student)}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors group"
                  >
                    {/* Student ID */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-mono font-semibold text-emerald-800 dark:text-emerald-400 tabular-nums">
                        {formatStudentId(student.studentId)}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {student.title}{student.firstName} {student.lastName}
                        </span>
                        {(relatedDegreesMap.get(student.id)?.length || 0) > 0 && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectStudent(student);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-750 hover:bg-amber-200 transition"
                            title={`คลิกเพื่อดูหลักสูตรทั้งหมดของ น.ศ. ท่านนี้ (${(relatedDegreesMap.get(student.id)?.length || 0) + 1} หลักสูตร)`}
                          >
                            <GraduationCap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>เรียน {(relatedDegreesMap.get(student.id)?.length || 0) + 1} ใบ</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {student.email || '-'}
                      </div>
                    </td>

                    {/* Faculty & Major */}
                    <td className="py-3 px-3.5">
                      <div className="font-medium text-neutral-800 dark:text-neutral-200 max-w-[240px] truncate">
                        {student.faculty}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-[240px] truncate">
                        {student.major || '-'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`text-xs ${getStatusBadgeClass(student.status)}`}>
                        {student.status}
                      </span>
                    </td>

                    {/* Province */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                      {student.province}
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                      {formatPhoneNumber(student.phone)}
                    </td>

                    {/* Academic Year */}
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono tabular-nums text-neutral-500">
                      {student.academicYear ? `พ.ศ. ${student.academicYear}` : '-'}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                          title="ดูประวัติและบัตรนักศึกษา"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950 transition"
                          title="แก้ไขข้อมูลทันที"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id, `${student.title}${student.firstName} ${student.lastName}`)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                          title="ลบข้อมูล"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => onSelectStudent(student)}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs hover:border-emerald-500/50 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Header row: ID & Status */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800 text-xs">
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">
                    {formatStudentId(student.studentId)}
                  </span>
                  <span className={getStatusBadgeClass(student.status)}>
                    {student.status}
                  </span>
                </div>

                {/* Name & Academic info */}
                <div className="mt-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {student.title}{student.firstName} {student.lastName}
                    </h3>
                    {(relatedDegreesMap.get(student.id)?.length || 0) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-750">
                        <GraduationCap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>เรียน {(relatedDegreesMap.get(student.id)?.length || 0) + 1} ใบ</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mt-1">
                    {student.faculty}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    วิชาเอก: {student.major || '-'}
                  </p>
                </div>

                {/* Contact and Location Details */}
                <div className="mt-3 space-y-1 text-xs text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-1.5 font-mono tabular-nums">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{formatPhoneNumber(student.phone)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{student.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{student.district ? `${student.district}, ` : ''}{student.province}</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar on Card */}
              <div
                className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[11px] text-neutral-400 font-mono">
                  {student.academicYear ? `พ.ศ. ${student.academicYear}` : '-'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditStudent(student)}
                    className="px-2.5 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg hover:bg-emerald-100 transition flex items-center gap-1 min-h-[36px]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>แก้ไขทันที</span>
                  </button>
                  <button
                    onClick={() => onDeleteStudent(student.id, `${student.title}${student.firstName} ${student.lastName}`)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="ลบข้อมูล"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
