import { useMemo, useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  PencilIcon,
  EyeIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import userService from '../../lib/api/userService';
import type { Student } from '../../lib/api/userService';
import toast from 'react-hot-toast';
import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Modal from '~/components/ui/Modal';
import Input from '~/components/ui/Input';
import EmptyState from '~/components/ui/EmptyState';

export default function StudentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [pendingStatusStudent, setPendingStatusStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_id: '',
    phone: '',
    institution: '',
    status: 'active' as Student['status'],
  });

  // Fetch students
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['students', page, searchTerm, statusFilter, routeFilter],
    queryFn: () => {
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (routeFilter !== 'all') filters.route_id = routeFilter;
      if (searchTerm) filters.search = searchTerm;

      return userService.getStudents(page, 20, filters);
    },
    refetchInterval: 30000,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ studentId, status }: { studentId: string; status: string }) =>
      userService.updateStudentStatus(studentId, status as any),
    onSuccess: () => {
      toast.success('Student status updated');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: (payload: Partial<Student>) => userService.createStudent(payload),
    onSuccess: () => {
      toast.success('Student created successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create student');
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Student> }) =>
      userService.updateStudent(id, payload),
    onSuccess: () => {
      toast.success('Student updated successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update student');
    },
  });

  const handleStatusChange = (studentId: string, status: string) => {
    updateStatusMutation.mutate({ studentId, status });
  };

  const handleToggleStatus = (student: Student) => {
    if (student.status === 'active') {
      setPendingStatusStudent(student);
      return;
    }

    if (student.status === 'inactive') {
      handleStatusChange(student.id, 'active');
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    switch (action) {
      case 'export':
        toast.success(`Exporting ${selectedStudents.length} students...`);
        // TODO: Implement export
        break;
      case 'email':
        toast.success(`Sending email to ${selectedStudents.length} students...`);
        // TODO: Implement email
        break;
      default:
        break;
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      student_id: '',
      phone: '',
      institution: '',
      status: 'active',
    });
    setActiveStudent(null);
  };

  const openCreateForm = () => {
    resetForm();
    setFormMode('create');
    setIsFormOpen(true);
  };

  const openEditForm = (student: Student) => {
    setFormMode('edit');
    setActiveStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      student_id: student.student_id || '',
      phone: student.phone || '',
      institution: student.institution || '',
      status: student.status || 'active',
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: Partial<Student> = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      student_id: formData.student_id.trim(),
      phone: formData.phone.trim() || undefined,
      institution: formData.institution.trim() || undefined,
      status: formData.status,
    };

    if (formMode === 'create') {
      createStudentMutation.mutate(payload);
      return;
    }

    if (activeStudent) {
      updateStudentMutation.mutate({ id: activeStudent.id, payload });
    }
  };

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'active':
        return 'bg-slate-100 text-slate-700';
      case 'inactive':
        return 'bg-slate-200 text-slate-600';
      case 'suspended':
        return 'bg-slate-300 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const students = data?.users || [];
  const total = data?.total || 0;
  const lastPage = data?.last_page || 1;
  const stats = useMemo(() => {
    const totalCount = total || students.length;
    return {
      total: totalCount,
      active: students.filter((student) => student.status === 'active').length,
      inactive: students.filter((student) => student.status === 'inactive').length,
      suspended: students.filter((student) => student.status === 'suspended').length,
    };
  }, [students, total]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-500">
            Track enrollment, status, and route assignments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => refetch()} isLoading={isFetching}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openCreateForm}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Student
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-white/80">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Students</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </Card>
        <Card className="border-0 bg-slate-50/80">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Active</p>
          <p className="text-3xl font-bold text-slate-700 mt-2">{stats.active}</p>
        </Card>
        <Card className="border-0 bg-slate-100/80">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Inactive</p>
          <p className="text-3xl font-bold text-slate-700 mt-2">{stats.inactive}</p>
        </Card>
        <Card className="border-0 bg-slate-200/80">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Suspended</p>
          <p className="text-3xl font-bold text-slate-700 mt-2">{stats.suspended}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/90">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, student ID, email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300/80 rounded-lg bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300/80 rounded-lg bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Route Filter */}
          <div>
            <select
              value={routeFilter}
              onChange={(e) => {
                setRouteFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300/80 rounded-lg bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Routes</option>
              {/* TODO: Fetch routes for filter */}
            </select>
          </div>
        </div>
      </Card>

      {isError && (
        <Card className="border border-rose-200 bg-rose-50/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-rose-700">Unable to load students</p>
              <p className="text-xs text-rose-600 mt-1">
                {(error as Error)?.message || 'Please check the connection and try again.'}
              </p>
            </div>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <Card className="border border-blue-200 bg-blue-50/80">
          <span className="text-sm text-blue-800">
            {selectedStudents.length} student(s) selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkAction('export')}
              className="flex items-center px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-sm"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Export
            </button>
            <button
              onClick={() => handleBulkAction('email')}
              className="flex items-center px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-sm"
            >
              <EnvelopeIcon className="h-4 w-4 mr-1" />
              Send Email
            </button>
            <button
              onClick={() => setSelectedStudents([])}
              className="px-3 py-1 text-sm text-blue-700 hover:text-blue-900"
            >
              Clear
            </button>
          </div>
        </Card>
      )}

      {/* Students Table */}
      <Card padding="none" className="overflow-hidden bg-white/90">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading students...</span>
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={<UserGroupIcon className="h-12 w-12 text-gray-400" />}
            title="No students found"
            description="Get started by creating a new student record."
            action={
              <Button onClick={openCreateForm}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === students.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(students.map((s) => s.id));
                          } else {
                            setSelectedStudents([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Institution
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter((id) => id !== student.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.institution || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.route_name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            student.status
                          )}`}
                        >
                          {student.status === 'inactive'
                            ? 'Inactive'
                            : student.status === 'suspended'
                            ? 'Suspended'
                            : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={student.status === 'active'}
                              disabled={student.status === 'suspended'}
                              onChange={() => handleToggleStatus(student)}
                            />
                            <span className="relative h-5 w-10 rounded-full bg-slate-200 transition-colors peer-checked:bg-slate-600 peer-focus:ring-2 peer-focus:ring-slate-400/40 peer-disabled:opacity-50 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"></span>
                          </label>
                          <button
                            onClick={() => navigate(`/students/${student.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditForm(student)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page === lastPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(page - 1) * 20 + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(page * 20, total)}
                      </span>{' '}
                      of <span className="font-medium">{total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                        let pageNum;
                        if (lastPage <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= lastPage - 2) {
                          pageNum = lastPage - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                        disabled={page === lastPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          resetForm();
        }}
        title={formMode === 'create' ? 'Add New Student' : 'Edit Student'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
            Keep student records accurate for onboarding, route allocation, and billing.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Student ID"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Institution"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Student['status'] })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createStudentMutation.isPending || updateStudentMutation.isPending}
            >
              {formMode === 'create' ? 'Create Student' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={pendingStatusStudent !== null}
        onClose={() => setPendingStatusStudent(null)}
        title="Set Student Inactive"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
            This will temporarily disable access for{' '}
            <span className="font-semibold text-slate-700">
              {pendingStatusStudent?.name || 'this student'}
            </span>
            . You can reactivate at any time.
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setPendingStatusStudent(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-slate-800 text-white hover:bg-slate-700"
              onClick={() => {
                if (pendingStatusStudent) {
                  handleStatusChange(pendingStatusStudent.id, 'inactive');
                }
                setPendingStatusStudent(null);
              }}
            >
              Confirm Inactive
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
