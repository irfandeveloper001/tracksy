// Student Types
// Type definitions for student-related data

export interface Student {
  id: string;
  studentId: string;
  name: string;
  grade: string;
  status: 'active' | 'inactive';
  busRoute: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address: string;
  joinDate: string;
  emergencyContact?: string;
  medicalInfo?: string;
  notes?: string;
}

export interface StudentFilters {
  status: string[];
  grade: string[];
  busRoute: string;
  search: string;
}

export interface StudentSortOption {
  field: 'id' | 'name' | 'grade' | 'joinDate';
  direction: 'asc' | 'desc';
}

export interface BulkStudentAction {
  action: 'activate' | 'deactivate' | 'export' | 'delete' | 'assign-bus';
  studentIds: string[];
  metadata?: Record<string, any>;
}

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  byGrade: Record<string, number>;
  byBusRoute: Record<string, number>;
}

