// Students Component Exports
// Centralized exports for student-related components

export { default as StudentsTable } from './StudentsTable';
export { useStudents } from './useStudents';
export { 
  mockStudents, 
  getStudentById, 
  getStudentsByGrade, 
  getStudentsByBusRoute,
  getActiveStudents,
  getInactiveStudents,
} from './mockData';

export type { 
  Student, 
  StudentFilters, 
  StudentSortOption, 
  BulkStudentAction,
  StudentStats,
} from './types';

