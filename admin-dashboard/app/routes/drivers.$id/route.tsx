import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  TruckIcon,
  MapPinIcon,
  IdentificationIcon,
  PencilIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import userService from '../../lib/api/userService';
import TripHistory from '../../components/buses/TripHistory';
import Modal from '~/components/ui/Modal';
import Input from '~/components/ui/Input';
import Button from '~/components/ui/Button';
import toast from 'react-hot-toast';
import Card from '~/components/ui/Card';

export default function DriverDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    driver_id: '',
    phone: '',
    license_number: '',
    status: 'active' as 'active' | 'inactive' | 'on_leave',
  });

  // Fetch driver details
  const { data: driver, isLoading } = useQuery({
    queryKey: ['driver', id],
    queryFn: () => userService.getDriverById(id!),
    enabled: !!id,
    refetchInterval: 30000,
  });

  // Fetch trip history
  const { data: tripHistory } = useQuery({
    queryKey: ['driver-trips', id],
    queryFn: () => userService.getDriverTripHistory(id!, 1, 10),
    enabled: !!id,
  });

  const updateDriverMutation = useMutation({
    mutationFn: (payload: Partial<typeof formData>) =>
      userService.updateDriver(id!, payload),
    onSuccess: () => {
      toast.success('Driver updated successfully');
      queryClient.invalidateQueries({ queryKey: ['driver', id] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setIsEditOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update driver');
    },
  });

  useEffect(() => {
    if (!driver) return;
    setFormData({
      name: driver.name || '',
      email: driver.email || '',
      driver_id: driver.driver_id || '',
      phone: driver.phone || '',
      license_number: driver.license_number || '',
      status: driver.status || 'active',
    });
  }, [driver]);

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateDriverMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      driver_id: formData.driver_id.trim(),
      phone: formData.phone.trim() || undefined,
      license_number: formData.license_number.trim() || undefined,
      status: formData.status,
    });
  };

  const memberSince = driver?.created_at ? new Date(driver.created_at) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading driver details...</span>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Driver not found</p>
        <button
          onClick={() => navigate('/drivers')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Drivers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/drivers')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{driver.name}</h1>
            <p className="mt-1 text-sm text-gray-600">Driver ID: {driver.driver_id}</p>
          </div>
        </div>
        <Button
          onClick={() => setIsEditOpen(true)}
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          <PencilIcon className="h-5 w-5 mr-2" />
          Edit Driver
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Driver Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Information */}
          <Card className="bg-white/90">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{driver.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{driver.email}</p>
                </div>
              </div>

              {driver.phone && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{driver.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Driver ID</p>
                  <p className="font-medium text-gray-900">{driver.driver_id}</p>
                </div>
              </div>

              {driver.license_number && (
                <div className="flex items-center space-x-3">
                  <IdentificationIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">License Number</p>
                    <p className="font-medium text-gray-900">{driver.license_number}</p>
                  </div>
                </div>
              )}

              {driver.license_expiry && (
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">License Expiry</p>
                    <p className="font-medium text-gray-900">
                      {new Date(driver.license_expiry).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {driver.bus_number && (
                <div className="flex items-center space-x-3">
                  <TruckIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Assigned Bus</p>
                    <p className="font-medium text-gray-900">{driver.bus_number}</p>
                  </div>
                </div>
              )}

              {driver.route_name && (
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Assigned Route</p>
                    <p className="font-medium text-gray-900">{driver.route_name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      driver.status === 'active'
                        ? 'bg-slate-100 text-slate-700'
                        : driver.status === 'on_leave'
                        ? 'bg-slate-300 text-slate-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {driver.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {memberSince ? memberSince.toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Trip History */}
        <div className="lg:col-span-2">
          <Card className="bg-white/90">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h2>
            <TripHistory trips={tripHistory?.trips || []} />
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Driver"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
            Keep driver credentials and availability updated for compliance and scheduling.
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
                  setFormData({ ...formData, status: e.target.value as typeof formData.status })
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
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={updateDriverMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
