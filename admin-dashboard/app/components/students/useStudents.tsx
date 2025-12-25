// useStudents Hook
// Custom hook for managing student data and operations

import { useState, useCallback } from 'react';
import type { Student, BulkStudentAction, StudentStats } from './types';

interface UseStudentsOptions {
  initialData?: Student[];
  onUpdate?: (students: Student[]) => void;
  onBulkAction?: (action: BulkStudentAction) => Promise<void>;
}

export function useStudents(options: UseStudentsOptions = {}) {
  const [students, setStudents] = useState<Student[]>(options.initialData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load students from API
  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/students');
      // const data = await response.json();
      // setStudents(data);
      
      // For now, use initial data
      if (options.initialData) {
        setStudents(options.initialData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, [options.initialData]);

  // Add new student
  const addStudent = useCallback(async (student: Omit<Student, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/students', {
      //   method: 'POST',
      //   body: JSON.stringify(student),
      // });
      // const newStudent = await response.json();
      
      const newStudent: Student = {
        ...student,
        id: Date.now().toString(),
      };
      
      const updatedStudents = [...students, newStudent];
      setStudents(updatedStudents);
      options.onUpdate?.(updatedStudents);
      return newStudent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add student');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [students, options]);

  // Update student
  const updateStudent = useCallback(async (id: string, updates: Partial<Student>) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/students/${id}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify(updates),
      // });
      // const updatedStudent = await response.json();
      
      const updatedStudents = students.map((student) =>
        student.id === id ? { ...student, ...updates } : student
      );
      setStudents(updatedStudents);
      options.onUpdate?.(updatedStudents);
      return updatedStudents.find((s) => s.id === id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [students, options]);

  // Delete student
  const deleteStudent = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/students/${id}`, { method: 'DELETE' });
      
      const updatedStudents = students.filter((student) => student.id !== id);
      setStudents(updatedStudents);
      options.onUpdate?.(updatedStudents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete student');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [students, options]);

  // Bulk activate students
  const bulkActivate = useCallback(async (ids: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      if (options.onBulkAction) {
        await options.onBulkAction({ action: 'activate', studentIds: ids });
      }
      
      const updatedStudents = students.map((student) =>
        ids.includes(student.id) ? { ...student, status: 'active' as const } : student
      );
      setStudents(updatedStudents);
      options.onUpdate?.(updatedStudents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate students');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [students, options]);

  // Bulk deactivate students
  const bulkDeactivate = useCallback(async (ids: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      if (options.onBulkAction) {
        await options.onBulkAction({ action: 'deactivate', studentIds: ids });
      }
      
      const updatedStudents = students.map((student) =>
        ids.includes(student.id) ? { ...student, status: 'inactive' as const } : student
      );
      setStudents(updatedStudents);
      options.onUpdate?.(updatedStudents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate students');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [students, options]);

  // Export students
  const exportStudents = useCallback(async (ids?: string[]) => {
    try {
      const studentsToExport = ids
        ? students.filter((s) => ids.includes(s.id))
        : students;
      
      // Convert to CSV
      const headers = ['Student ID', 'Name', 'Grade', 'Status', 'Bus Route', 'Parent Name', 'Parent Phone', 'Address'];
      const rows = studentsToExport.map((s) => [
        s.studentId,
        s.name,
        s.grade,
        s.status,
        s.busRoute,
        s.parentName,
        s.parentPhone,
        s.address,
      ]);
      
      const csv = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export students');
      throw err;
    }
  }, [students]);

  // Get statistics
  const getStats = useCallback((): StudentStats => {
    const stats: StudentStats = {
      total: students.length,
      active: students.filter((s) => s.status === 'active').length,
      inactive: students.filter((s) => s.status === 'inactive').length,
      byGrade: {},
      byBusRoute: {},
    };

    students.forEach((student) => {
      // By grade
      stats.byGrade[student.grade] = (stats.byGrade[student.grade] || 0) + 1;
      
      // By bus route
      stats.byBusRoute[student.busRoute] = (stats.byBusRoute[student.busRoute] || 0) + 1;
    });

    return stats;
  }, [students]);

  return {
    students,
    isLoading,
    error,
    loadStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkActivate,
    bulkDeactivate,
    exportStudents,
    getStats,
  };
}

