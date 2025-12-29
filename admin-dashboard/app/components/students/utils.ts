// Student Utilities
// Helper functions for student operations

import type { Student, StudentStats } from './types';

/**
 * Format student ID with leading zeros
 */
export function formatStudentId(id: number): string {
  return `STU${id.toString().padStart(3, '0')}`;
}

/**
 * Get student's full name with grade
 */
export function getStudentDisplayName(student: Student): string {
  return `${student.name} (Grade ${student.grade})`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Calculate age from join date
 */
export function calculateDaysEnrolled(joinDate: string): number {
  const join = new Date(joinDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - join.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get grade level description
 */
export function getGradeLevel(grade: string): 'Elementary' | 'Middle' | 'High' {
  const gradeNum = parseInt(grade);
  if (gradeNum <= 5) return 'Elementary';
  if (gradeNum <= 8) return 'Middle';
  return 'High';
}

/**
 * Validate student data
 */
export function validateStudent(student: Partial<Student>): string[] {
  const errors: string[] = [];

  if (!student.name || student.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!student.grade || student.grade.trim().length === 0) {
    errors.push('Grade is required');
  } else {
    const gradeNum = parseInt(student.grade);
    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
      errors.push('Grade must be between 1 and 12');
    }
  }

  if (!student.parentName || student.parentName.trim().length === 0) {
    errors.push('Parent name is required');
  }

  if (!student.parentPhone || student.parentPhone.trim().length === 0) {
    errors.push('Parent phone is required');
  } else if (!/^\+?[\d\s\-()]+$/.test(student.parentPhone)) {
    errors.push('Parent phone must be a valid phone number');
  }

  if (!student.address || student.address.trim().length === 0) {
    errors.push('Address is required');
  }

  if (!student.busRoute || student.busRoute.trim().length === 0) {
    errors.push('Bus route is required');
  }

  return errors;
}

/**
 * Search students by query
 */
export function searchStudents(students: Student[], query: string): Student[] {
  if (!query || query.trim().length === 0) {
    return students;
  }

  const lowerQuery = query.toLowerCase();
  return students.filter(
    (student) =>
      student.name.toLowerCase().includes(lowerQuery) ||
      student.studentId.toLowerCase().includes(lowerQuery) ||
      student.parentName.toLowerCase().includes(lowerQuery) ||
      student.busRoute.toLowerCase().includes(lowerQuery) ||
      student.grade.includes(lowerQuery)
  );
}

/**
 * Filter students by multiple criteria
 */
export function filterStudents(
  students: Student[],
  filters: {
    status?: string[];
    grade?: string[];
    busRoute?: string;
  }
): Student[] {
  let result = [...students];

  if (filters.status && filters.status.length > 0) {
    result = result.filter((s) => filters.status!.includes(s.status));
  }

  if (filters.grade && filters.grade.length > 0) {
    result = result.filter((s) => filters.grade!.includes(s.grade));
  }

  if (filters.busRoute) {
    result = result.filter((s) =>
      s.busRoute.toLowerCase().includes(filters.busRoute!.toLowerCase())
    );
  }

  return result;
}

/**
 * Sort students
 */
export function sortStudents(
  students: Student[],
  sortBy: 'id' | 'name' | 'grade' | 'joinDate',
  direction: 'asc' | 'desc'
): Student[] {
  const sorted = [...students].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'id':
        comparison = a.studentId.localeCompare(b.studentId);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'grade':
        comparison = parseInt(a.grade) - parseInt(b.grade);
        break;
      case 'joinDate':
        comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Calculate student statistics
 */
export function calculateStats(students: Student[]): StudentStats {
  const stats: StudentStats = {
    total: students.length,
    active: 0,
    inactive: 0,
    byGrade: {},
    byBusRoute: {},
  };

  students.forEach((student) => {
    // Count by status
    if (student.status === 'active') {
      stats.active++;
    } else {
      stats.inactive++;
    }

    // Count by grade
    stats.byGrade[student.grade] = (stats.byGrade[student.grade] || 0) + 1;

    // Count by bus route
    stats.byBusRoute[student.busRoute] = (stats.byBusRoute[student.busRoute] || 0) + 1;
  });

  return stats;
}

/**
 * Export students to CSV
 */
export function exportToCSV(students: Student[]): string {
  const headers = [
    'Student ID',
    'Name',
    'Grade',
    'Status',
    'Bus Route',
    'Parent Name',
    'Parent Phone',
    'Parent Email',
    'Address',
    'Join Date',
    'Emergency Contact',
    'Medical Info',
    'Notes',
  ];

  const rows = students.map((s) => [
    s.studentId,
    s.name,
    s.grade,
    s.status,
    s.busRoute,
    s.parentName,
    s.parentPhone,
    s.parentEmail || '',
    s.address,
    s.joinDate,
    s.emergencyContact || '',
    s.medicalInfo || '',
    s.notes || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Group students by grade
 */
export function groupByGrade(students: Student[]): Record<string, Student[]> {
  return students.reduce((acc, student) => {
    const grade = student.grade;
    if (!acc[grade]) {
      acc[grade] = [];
    }
    acc[grade].push(student);
    return acc;
  }, {} as Record<string, Student[]>);
}

/**
 * Group students by bus route
 */
export function groupByBusRoute(students: Student[]): Record<string, Student[]> {
  return students.reduce((acc, student) => {
    const route = student.busRoute;
    if (!acc[route]) {
      acc[route] = [];
    }
    acc[route].push(student);
    return acc;
  }, {} as Record<string, Student[]>);
}

/**
 * Get unique grades from students
 */
export function getUniqueGrades(students: Student[]): string[] {
  const grades = students.map((s) => s.grade);
  return Array.from(new Set(grades)).sort((a, b) => parseInt(a) - parseInt(b));
}

/**
 * Get unique bus routes from students
 */
export function getUniqueBusRoutes(students: Student[]): string[] {
  const routes = students.map((s) => s.busRoute);
  return Array.from(new Set(routes)).sort();
}

