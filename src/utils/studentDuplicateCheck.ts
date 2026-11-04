import { Student } from '../types/student';
import { formatStudentId } from './validation';

export type DuplicateType = 'EXACT_ID' | 'SAME_PERSON_SAME_FACULTY' | null;

export interface DuplicateCheckResult {
  // 1. Accidental Duplicate Entry (บันทึกซ้ำกัน)
  isDuplicateEntry: boolean;
  duplicateType: DuplicateType;
  duplicateStudent?: Student;
  errorMessage?: string;

  // 2. Multi-Degree Student (น.ศ.เรียนหลายใบ)
  isMultiDegree: boolean;
  multiDegreeStudents: Student[];
  multiDegreeCount: number; // total degrees found for this student
  noticeMessage?: string;
}

/**
 * Check whether a student being edited or added has duplicate records
 * or is a student enrolled in multiple degrees (เรียนหลายใบ) in STOU.
 */
export function checkStudentDuplicates(
  student: Partial<Student>,
  allStudents: Student[],
  currentId?: string
): DuplicateCheckResult {
  const result: DuplicateCheckResult = {
    isDuplicateEntry: false,
    duplicateType: null,
    isMultiDegree: false,
    multiDegreeStudents: [],
    multiDegreeCount: 1,
  };

  const rawId = (student.studentId || '').replace(/\D/g, '');
  const firstName = (student.firstName || '').trim().toLowerCase();
  const lastName = (student.lastName || '').trim().toLowerCase();
  const rawPhone = (student.phone || '').replace(/\D/g, '');
  const rawIdCard = (student.idCardNumber || '').replace(/\D/g, '');
  const faculty = (student.faculty || '').trim();
  const major = (student.major || '').trim();

  // Exclude the record currently being edited
  const pool = allStudents.filter((s) => s.id !== currentId);

  // Set of related student record IDs to avoid duplicates
  const relatedMap = new Map<string, Student>();

  // Check 1: Find any records matching the same person (First Name + Last Name)
  if (firstName && lastName) {
    pool.forEach((s) => {
      const sFirst = s.firstName.trim().toLowerCase();
      const sLast = s.lastName.trim().toLowerCase();
      if (sFirst === firstName && sLast === lastName) {
        relatedMap.set(s.id, s);
      }
    });
  }

  // Check 2: Match by Citizen ID (13 digits) if provided
  if (rawIdCard && rawIdCard.length === 13) {
    pool.forEach((s) => {
      const sIdCard = (s.idCardNumber || '').replace(/\D/g, '');
      if (sIdCard && sIdCard === rawIdCard) {
        relatedMap.set(s.id, s);
      }
    });
  }

  // Check 3: Match by 10-digit Student ID
  let exactIdMatchedStudent: Student | undefined;
  if (rawId && rawId.length === 10) {
    exactIdMatchedStudent = pool.find(
      (s) => s.studentId.replace(/\D/g, '') === rawId
    );
  }

  // Analyze the matched records
  if (exactIdMatchedStudent) {
    const isSamePersonName =
      firstName &&
      lastName &&
      exactIdMatchedStudent.firstName.trim().toLowerCase() === firstName &&
      exactIdMatchedStudent.lastName.trim().toLowerCase() === lastName;

    if (isSamePersonName) {
      // Same person & same ID: check if it's the exact same faculty/major
      if (exactIdMatchedStudent.faculty === faculty && (!major || exactIdMatchedStudent.major === major)) {
        result.isDuplicateEntry = true;
        result.duplicateType = 'SAME_PERSON_SAME_FACULTY';
        result.duplicateStudent = exactIdMatchedStudent;
        result.errorMessage = `ตรวจพบการบันทึกซ้ำซ้อน: นักศึกษาชื่อ ${exactIdMatchedStudent.title}${exactIdMatchedStudent.firstName} ${exactIdMatchedStudent.lastName} มีข้อมูลใน${exactIdMatchedStudent.faculty} (${exactIdMatchedStudent.major || '-'}) รหัส ${formatStudentId(exactIdMatchedStudent.studentId)} อยู่ในระบบแล้ว`;
      } else {
        // Same person & same ID, but enrolled in a different faculty or major (สัมฤทธิบัตร / วิชาเอกคู่)
        relatedMap.set(exactIdMatchedStudent.id, exactIdMatchedStudent);
      }
    } else {
      // Different person with the same 10-digit ID -> pure ID collision / typing error
      result.isDuplicateEntry = true;
      result.duplicateType = 'EXACT_ID';
      result.duplicateStudent = exactIdMatchedStudent;
      result.errorMessage = `รหัสนักศึกษา ${formatStudentId(rawId)} มีอยู่ในระบบแล้ว เป็นของ "${exactIdMatchedStudent.title}${exactIdMatchedStudent.firstName} ${exactIdMatchedStudent.lastName}" (${exactIdMatchedStudent.faculty}) กรุณาตรวจสอบรหัส 10 หลักอีกครั้ง`;
    }
  }

  // Check if any matched record by name has the exact same faculty and major -> Duplicate entry
  const relatedList = Array.from(relatedMap.values());
  for (const rel of relatedList) {
    if (rel.faculty === faculty && rel.major === major && (!rawId || rel.studentId.replace(/\D/g, '') === rawId)) {
      result.isDuplicateEntry = true;
      result.duplicateType = 'SAME_PERSON_SAME_FACULTY';
      result.duplicateStudent = rel;
      result.errorMessage = `ตรวจพบการบันทึกซ้ำซ้อน: นักศึกษาชื่อ ${rel.title}${rel.firstName} ${rel.lastName} บันทึกอยู่ใน ${rel.faculty} แขนงวิชา ${rel.major} (รหัส ${formatStudentId(rel.studentId)}) อยู่แล้ว`;
      break;
    }
  }

  // If there are other records for this person with different degree/faculty/major/ID, it is "เรียนหลายใบ"
  const multiDegrees = relatedList.filter((s) => s.id !== result.duplicateStudent?.id);
  if (multiDegrees.length > 0) {
    result.isMultiDegree = true;
    result.multiDegreeStudents = multiDegrees;
    result.multiDegreeCount = multiDegrees.length + 1; // including the one being registered/viewed
    result.noticeMessage = `น.ศ. ท่านนี้มีประวัติเรียนหลักสูตรอื่นใน มสธ. ลำปาง (เรียนหลายใบ) รวม ${multiDegrees.length} หลักสูตรเดิมในระบบ`;
  }

  return result;
}

/**
 * Find all related degree records for a student by full name or citizen ID or phone.
 */
export function findRelatedStudentDegrees(
  student: Student,
  allStudents: Student[]
): Student[] {
  if (!student) return [];

  const firstName = student.firstName.trim().toLowerCase();
  const lastName = student.lastName.trim().toLowerCase();
  const rawId = student.studentId.replace(/\D/g, '');
  const rawPhone = student.phone.replace(/\D/g, '');
  const rawIdCard = (student.idCardNumber || '').replace(/\D/g, '');

  return allStudents.filter((s) => {
    if (s.id === student.id) return false;

    // Match exact full name
    const sFirst = s.firstName.trim().toLowerCase();
    const sLast = s.lastName.trim().toLowerCase();
    if (firstName && lastName && sFirst === firstName && sLast === lastName) {
      return true;
    }

    // Match Citizen ID
    if (rawIdCard && rawIdCard.length === 13) {
      const sIdCard = (s.idCardNumber || '').replace(/\D/g, '');
      if (sIdCard && sIdCard === rawIdCard) return true;
    }

    // Match Student ID (in case of double degree under same ID)
    if (rawId && rawId.length === 10) {
      const sRawId = s.studentId.replace(/\D/g, '');
      if (sRawId === rawId && sFirst === firstName) return true;
    }

    // Match Phone if name matches partially
    if (rawPhone && rawPhone.length === 10) {
      const sPhone = s.phone.replace(/\D/g, '');
      if (sPhone === rawPhone && (sFirst === firstName || sLast === lastName)) return true;
    }

    return false;
  });
}
