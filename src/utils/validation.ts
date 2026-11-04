import { Student } from '../types/student';
import { checkStudentDuplicates } from './studentDuplicateCheck';

/**
 * Validate a student record before saving (relaxed rules for fast manual entry / partial records)
 * - Name (First/Last name) is required.
 * - Student ID: If provided, checks 10 digits and duplicate check.
 * - Major, Phone, Email, Academic Year, Status: OPTIONAL (no blocking error if empty).
 */
export function validateStudent(
  student: Partial<Student>,
  existingStudents: Student[],
  currentId?: string
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // 1. Student ID Validation (10 digits) - Optional or recommended
  const rawStudentId = (student.studentId || '').replace(/\D/g, '');
  if (rawStudentId) {
    if (rawStudentId.length !== 10) {
      errors.studentId = 'รหัสนักศึกษาต้องเป็นตัวเลข 10 หลัก (ปัจจุบันมี ' + rawStudentId.length + ' หลัก)';
    }
  }

  // Check duplicate entries (แยกชัดเจนระหว่าง บันทึกซ้ำซ้อน กับ น.ศ. เรียนหลายใบ)
  const dupCheck = checkStudentDuplicates(student, existingStudents, currentId);
  if (dupCheck.isDuplicateEntry && dupCheck.errorMessage) {
    if (dupCheck.duplicateType === 'EXACT_ID') {
      errors.studentId = dupCheck.errorMessage;
    } else {
      errors.firstName = dupCheck.errorMessage;
    }
  }

  // 2. Name Validation (Required)
  if (!student.firstName?.trim()) {
    errors.firstName = 'กรุณากรอกชื่อจริง';
  }
  if (!student.lastName?.trim()) {
    errors.lastName = 'กรุณากรอกนามสกุล';
  }

  // 3. Faculty (Optional / Recommended)
  // Non-blocking

  // 4. Phone Validation (Optional - only validate if user entered something)
  const rawPhone = (student.phone || '').replace(/\D/g, '');
  if (rawPhone && !/^0[2689]\d{7,8}$/.test(rawPhone) && !/^0\d{8,9}$/.test(rawPhone)) {
    errors.phone = 'เบอร์โทรศัพท์ควรขึ้นต้นด้วย 0 และมีตัวเลข 9-10 หลัก';
  }

  // 5. Email Validation (Optional - only validate if user entered something)
  if (student.email?.trim()) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(student.email.trim())) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง (ตัวอย่าง: student@stou.ac.th)';
    }
  }

  // 6. Postal Code (Optional - only validate if user entered something)
  if (student.postalCode) {
    const rawPostal = student.postalCode.replace(/\D/g, '');
    if (rawPostal && rawPostal.length !== 5) {
      errors.postalCode = 'รหัสไปรษณีย์ควรเป็นตัวเลข 5 หลัก';
    }
  }

  // 7. Academic Year (Optional)
  if (student.academicYear && (student.academicYear < 2500 || student.academicYear > 2600)) {
    errors.academicYear = 'ปีการศึกษาต้องอยู่ในช่วง พ.ศ. 2500 - 2600';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format 10-digit Thai phone number into 081-234-5678 or 02-123-4567
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  if (clean.length === 9) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5)}`;
  }
  return phone;
}

/**
 * Format Student ID with separator (e.g., 6630014523 -> 66-3001-4523)
 */
export function formatStudentId(id: string): string {
  if (!id) return '-';
  const clean = id.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return id;
}
