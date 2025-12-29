import { useMemo, useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import userService from '../../lib/api/userService';
import type { Admin } from '../../lib/api/userService';
import toast from 'react-hot-toast';
import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Modal from '~/components/ui/Modal';
import Input from '~/components/ui/Input';
import EmptyState from '~/components/ui/EmptyState';

export default function AdminsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeAdmin, setActiveAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin' as Admin['role'],
    status: 'active' as Admin['status'],
  });

  // Fetch admins
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['admins', page, searchTerm, roleFilter, statusFilter],
    queryFn: () => {
      const filters: any = {};
      if (roleFilter !== 'all') filters.role = roleFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (searchTerm) filters.search = searchTerm;

      return userService.getAdmins(page, 20, filters);
    },
    refetchInterval: 30000,
  });

  // Delete admin mutation
  const deleteMutation = useMutation({
    mutationFn: userService.deleteAdmin,
    onSuccess: () => {
      toast.success('Admin deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete admin');
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: (payload: Partial<Admin>) => userService.createAdmin(payload),
    onSuccess: () => {
      toast.success('Admin created successfully');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create admin');
    },
  });

  const updateAdminMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Admin> }) =>
      userService.updateAdmin(id, payload),
    onSuccess: () => {
      toast.success('Admin updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update admin');
    },
  });

  const handleDelete = (adminId: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      deleteMutation.mutate(adminId);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'admin',
      status: 'active',
    });
    setActiveAdmin(null);
  };

  const openCreateForm = () => {
    resetForm();
    setFormMode('create');
    setIsFormOpen(true);
  };

  const openEditForm = (admin: Admin) => {
    setFormMode('edit');
    setActiveAdmin(admin);
    setFormData({
      name: admin.name || '',
      email: admin.email || '',
      role: admin.role || 'admin',
      status: admin.status || 'active',
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: Partial<Admin> = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      status: formData.status,
    };

    if (formMode === 'create') {
      createAdminMutation.mutate(payload);
      return;
    }

    if (activeAdmin) {
      updateAdminMutation.mutate({ id: activeAdmin.id, payload });
    }
  };

  const getRoleColor = (role: Admin['role']) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Admin['status']) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const admins = data?.users || [];
  const total = data?.total || 0;
  const lastPage = data?.last_page || 1;
  const stats = useMemo(() => {
    const totalCount = total || admins.length;
    return {
      total: totalCount,
      superAdmins: admins.filter((admin) => admin.role === 'super_admin').length,
      admins: admins.filter((admin) => admin.role === 'admin').length,
      viewers: admins.filter((admin) => admin.role === 'viewer').length,
    };
  }, [admins, total]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Management</h1>
          <p className="text-sm text-gray-500">
            Control access levels, roles, and permissions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => refetch()} isLoading={isFetching}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openCreateForm}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Admin
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-white/80">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Admins</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </Card>
        <Card className="border-0 bg-rose-50/80">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Super Admins</p>
          <p className="text-3xl font-bold text-rose-600 mt-2">{stats.superAdmins}</p>
        </Card>
        <Card className="border-0 bg-blue-50/80">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Admins</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.admins}</p>
        </Card>
        <Card className="border-0 bg-slate-100/80">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Viewers</p>
          <p className="text-3xl font-bold text-slate-700 mt-2">{stats.viewers}</p>
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
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300/80 rounded-lg bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300/80 rounded-lg bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
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
            </select>
          </div>
        </div>
      </Card>

      {isError && (
        <Card className="border border-rose-200 bg-rose-50/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-rose-700">Unable to load admins</p>
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

      {/* Admins Table */}
      <Card padding="none" className="overflow-hidden bg-white/90">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading admins...</span>
          </div>
        ) : admins.length === 0 ? (
          <EmptyState
            icon={<ShieldCheckIcon className="h-12 w-12 text-gray-400" />}
            title="No admins found"
            description="Get started by creating a new admin user."
            action={
              <Button onClick={openCreateForm}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {admin.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(
                            admin.role
                          )}`}
                        >
                          {admin.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            admin.status
                          )}`}
                        >
                          {admin.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.permissions?.length || 0} permissions
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditForm(admin)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
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
        title={formMode === 'create' ? 'Add New Admin' : 'Edit Admin'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as Admin['role'] })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Admin['status'] })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
              isLoading={createAdminMutation.isPending || updateAdminMutation.isPending}
            >
              {formMode === 'create' ? 'Create Admin' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
