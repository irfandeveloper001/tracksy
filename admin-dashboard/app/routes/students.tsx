// Students Page Route
// Main page for managing students

import { useState, useEffect } from 'react';
import { StudentsTable, useStudents, mockStudents } from '~/components/students';
import type { Student } from '~/components/students';
import Button from '~/components/ui/Button';
import Card from '~/components/ui/Card';

export default function StudentsPage() {
  const {
    students,
    isLoading,
    error,
    bulkActivate,
    bulkDeactivate,
    exportStudents,
    getStats,
  } = useStudents({ initialData: mockStudents });

  const [stats, setStats] = useState(getStats());

  useEffect(() => {
    setStats(getStats());
  }, [students, getStats]);

  const handleBulkAction = async (selectedIds: string[], action: string) => {
    try {
      switch (action) {
        case 'activate':
          await bulkActivate(selectedIds);
          break;
        case 'deactivate':
          await bulkDeactivate(selectedIds);
          break;
        case 'export':
          await exportStudents(selectedIds);
          break;
        default:
          console.log('Unknown action:', action);
      }
    } catch (err) {
      console.error('Bulk action failed:', err);
    }
  };

  const handleExportAll = async () => {
    try {
      await exportStudents();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Students</h1>
              <p className="mt-2 text-gray-600">
                Manage student information, status, and bus assignments
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleExportAll}>
                Export All
              </Button>
              <Button variant="primary">
                Add Student
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-3xl font-bold text-gray-600 mt-2">{stats.inactive}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Grades</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {Object.keys(stats.byGrade).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </Card>
        )}

        {/* Students Table */}
        <StudentsTable 
          initialData={students} 
          onBulkAction={handleBulkAction}
        />

        {/* Quick Stats by Grade */}
        <div className="mt-8">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Grade</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(stats.byGrade)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([grade, count]) => (
                  <div key={grade} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600">Grade {grade}</p>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Quick Stats by Bus Route */}
        <div className="mt-6 mb-8">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Bus Route</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats.byBusRoute)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([route, count]) => (
                  <div key={route} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">{route}</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{count} students</p>
                    </div>
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

