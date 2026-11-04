import * as XLSX from 'xlsx';
import { Student } from '../types/student';
import { formatPhoneNumber, formatStudentId } from './validation';

export function exportStudentsToExcel(students: Student[], fileNamePrefix = 'STOU_Students'): void {
  // 1. Prepare main Student Data Sheet
  const studentRows = students.map((s, index) => ({
    'ลำดับ': index + 1,
    'รหัสนักศึกษา': s.studentId,
    'คำนำหน้า': s.title,
    'ชื่อ': s.firstName,
    'นามสกุล': s.lastName,
    'ชื่อ-นามสกุล': `${s.title}${s.firstName} ${s.lastName}`,
    'สาขาวิชา': s.faculty,
    'แขนงวิชา/วิชาเอก': s.major,
    'ศูนย์วิทยบริการฯ': s.stouCenter,
    'ปีการศึกษาที่เข้า': s.academicYear,
    'ภาคการศึกษา': `ภาค ${s.entrySemester}`,
    'สถานภาพนักศึกษา': s.status,
    'เบอร์โทรศัพท์': formatPhoneNumber(s.phone),
    'อีเมล': s.email,
    'LINE ID': s.lineId || '-',
    'ที่อยู่': s.address,
    'ตำบล/แขวง': s.subdistrict,
    'อำเภอ/เขต': s.district,
    'จังหวัด': s.province,
    'รหัสไปรษณีย์': s.postalCode,
    'หมายเหตุ': s.notes || '-',
  }));

  const studentWorksheet = XLSX.utils.json_to_sheet(studentRows);

  // Set column widths for readable viewing
  studentWorksheet['!cols'] = [
    { wch: 6 },  // ลำดับ
    { wch: 14 }, // รหัสนักศึกษา
    { wch: 10 }, // คำนำหน้า
    { wch: 15 }, // ชื่อ
    { wch: 18 }, // นามสกุล
    { wch: 25 }, // ชื่อ-นามสกุล
    { wch: 28 }, // สาขาวิชา
    { wch: 32 }, // แขนงวิชา
    { wch: 28 }, // ศูนย์วิทยบริการ
    { wch: 12 }, // ปีการศึกษา
    { wch: 12 }, // ภาค
    { wch: 18 }, // สถานภาพ
    { wch: 16 }, // เบอร์โทร
    { wch: 26 }, // อีเมล
    { wch: 16 }, // LINE ID
    { wch: 35 }, // ที่อยู่
    { wch: 15 }, // ตำบล
    { wch: 15 }, // อำเภอ
    { wch: 15 }, // จังหวัด
    { wch: 12 }, // รหัสไปรษณีย์
    { wch: 10 }, // GPA
    { wch: 30 }, // หมายเหตุ
  ];

  // 2. Prepare Summary Sheet by Faculty
  const facultyCounts: Record<string, number> = {};
  students.forEach((s) => {
    facultyCounts[s.faculty] = (facultyCounts[s.faculty] || 0) + 1;
  });

  const facultySummaryRows = Object.entries(facultyCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([faculty, count], idx) => ({
      'ลำดับ': idx + 1,
      'สาขาวิชา': faculty,
      'จำนวนนักศึกษา (คน)': count,
      'คิดเป็นร้อยละ (%)': Number(((count / (students.length || 1)) * 100).toFixed(1)),
    }));

  const facultyWorksheet = XLSX.utils.json_to_sheet(facultySummaryRows);
  facultyWorksheet['!cols'] = [{ wch: 8 }, { wch: 35 }, { wch: 20 }, { wch: 18 }];

  // 3. Prepare Summary Sheet by Status
  const statusCounts: Record<string, number> = {};
  students.forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });

  const statusSummaryRows = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count], idx) => ({
      'ลำดับ': idx + 1,
      'สถานภาพ': status,
      'จำนวนนักศึกษา (คน)': count,
      'คิดเป็นร้อยละ (%)': Number(((count / (students.length || 1)) * 100).toFixed(1)),
    }));

  const statusWorksheet = XLSX.utils.json_to_sheet(statusSummaryRows);
  statusWorksheet['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 20 }, { wch: 18 }];

  // 4. Create Workbook and Append Sheets
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, studentWorksheet, 'รายชื่อนักศึกษา');
  XLSX.utils.book_append_sheet(workbook, facultyWorksheet, 'สรุปตามสาขาวิชา');
  XLSX.utils.book_append_sheet(workbook, statusWorksheet, 'สรุปตามสถานภาพ');

  // 5. Generate and trigger download
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${fileNamePrefix}_${dateStr}.xlsx`);
}
