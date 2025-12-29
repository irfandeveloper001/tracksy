import { useMemo, useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  PencilIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import userService from '../../lib/api/userService';
import type { Driver } from '../../lib/api/userService';
import toast from 'react-hot-toast';
import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Modal from '~/components/ui/Modal';
import Input from '~/components/ui/Input';
import EmptyState from '~/components/ui/EmptyState';

export default function DriversPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeDriver, setActiveDriver] = useState<Driver | null>(null);
  const [pendingStatusDriver, setPendingStatusDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    driver_id: '',
    phone: '',
    license_number: '',
    status: 'active' as Driver['status'],
  });

  // Fetch drivers
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['drivers', page, searchTerm, statusFilter],
    queryFn: () => {
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (searchTerm) filters.search = searchTerm;

      return userService.getDrivers(page, 20, filters);
    },
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ driverId, status }: { driverId: string; status: Driver['status'] }) =>
      userService.updateDriverStatus(driverId, status),
    onSuccess: () => {
      toast.success('Driver status updated');
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update driver status');
    },
  });

  const handleToggleStatus = (driver: Driver) => {
    if (driver.status === 'active') {
      setPendingStatusDriver(driver);
      return;
    }

    if (driver.status === 'inactive') {
      updateStatusMutation.mutate({ driverId: driver.id, status: 'active' });
    }
  };

  const createDriverMutation = useMutation({
    mutationFn: (payload: Partial<Driver>) => userService.createDriver(payload),
    onSuccess: () => {
      toast.success('Driver created successfully');
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create driver');
    },
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Driver> }) =>
      userService.updateDriver(id, payload),
    onSuccess: () => {
      toast.success('Driver updated successfully');
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update driver');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      driver_id: '',
      phone: '',
      license_number: '',
      status: 'active',
    });
    setActiveDriver(null);
  };

  const openCreateForm = () => {
    resetForm();
    setFormMode('create');
    setIsFormOpen(true);
  };

  const openEditForm = (driver: Driver) => {
    setFormMode('edit');
    setActiveDriver(driver);
    setFormData({
      name: driver.name || '',
      email: driver.email || '',
      driver_id: driver.driver_id || '',
      phone: driver.phone || '',
      license_number: driver.license_number || '',
      status: driver.status || 'active',
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: Partial<Driver> = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      driver_id: formData.driver_id.trim(),
      phone: formData.phone.trim() || undefined,
      license_number: formData.license_number.trim() || undefined,
      status: formData.status,
    };

    if (formMode === 'create') {
      createDriverMutation.mutate(payload);
      return;
    }

    if (activeDriver) {
      updateDriverMutation.mutate({ id: activeDriver.id, payload });
    }
  };

  const getStatusColor = (status: Driver['status']) => {
    switch (status) {
      case 'active':
        return 'bg-slate-100 text-slate-700';
      case 'inactive':
        return 'bg-slate-200 text-slate-600';
      case 'on_leave':
        return 'bg-slate-300 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const drivers = data?.users || [];
  const total = data?.total || 0;
  const lastPage = data?.last_page || 1;
  const stats = useMemo(() => {
    const totalCount = total || drivers.length;
    return {
      total: totalCount,
      active: drivers.filter((driver) => driver.status === 'active').length,
      inactive: drivers.filter((driver) => driver.status === 'inactive').length,
      onLeave: drivers.filter((driver) => driver.status === 'on_leave').length,
    };
  }, [drivers, total]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Driver Management</h1>
          <p className="text-sm text-gray-500">
            Manage licenses, assignments, and availability.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => refetch()} isLoading={isFetching}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openCreateForm}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Driver
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-white/80">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Drivers</p>
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
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">On Leave</p>
          <p className="text-3xl font-bold text-slate-700 mt-2">{stats.onLeave}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/90">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, driver ID, email..."
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
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>
      </Card>

      {isError && (
        <Card className="border border-rose-200 bg-rose-50/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-rose-700">Unable to load drivers</p>
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

      {/* Drivers Table */}
      <Card padding="none" className="overflow-hidden bg-white/90">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading drivers...</span>
          </div>
        ) : drivers.length === 0 ? (
          <EmptyState
            icon={<TruckIcon className="h-12 w-12 text-gray-400" />}
            title="No drivers found"
            description="Get started by creating a new driver profile."
            action={
              <Button onClick={openCreateForm}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Driver
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
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Bus
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
                  {drivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {driver.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.driver_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.license_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.bus_number || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.route_name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            driver.status
                          )}`}
                        >
                          {driver.status === 'on_leave'
                            ? 'On Leave'
                            : driver.status === 'inactive'
                            ? 'Inactive'
                            : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={driver.status === 'active'}
                              disabled={driver.status === 'on_leave'}
                              onChange={() => handleToggleStatus(driver)}
                            />
                            <span className="relative h-5 w-10 rounded-full bg-slate-200 transition-colors peer-checked:bg-slate-600 peer-focus:ring-2 peer-focus:ring-slate-400/40 peer-disabled:opacity-50 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"></span>
                          </label>
                          <button
                            onClick={() => navigate(`/drivers/${driver.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditForm(driver)}
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
        title={formMode === 'create' ? 'Add New Driver' : 'Edit Driver'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
            Keep licenses and assignments updated for safe operations and audit readiness.
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
              label="Driver ID"
              value={formData.driver_id}
              onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="License Number"
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Driver['status'] })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
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
              isLoading={createDriverMutation.isPending || updateDriverMutation.isPending}
            >
              {formMode === 'create' ? 'Create Driver' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={pendingStatusDriver !== null}
        onClose={() => setPendingStatusDriver(null)}
        title="Set Driver Inactive"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
            This will pause assignments for{' '}
            <span className="font-semibold text-slate-700">
              {pendingStatusDriver?.name || 'this driver'}
            </span>
            . You can reactivate at any time.
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setPendingStatusDriver(null)}>
              Cancel
            </Button>
            <Button
              className="bg-slate-800 text-white hover:bg-slate-700"
              onClick={() => {
                if (pendingStatusDriver) {
                  updateStatusMutation.mutate({
                    driverId: pendingStatusDriver.id,
                    status: 'inactive',
                  });
                }
                setPendingStatusDriver(null);
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
