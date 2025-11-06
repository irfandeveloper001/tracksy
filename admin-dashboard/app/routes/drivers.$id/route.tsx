import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
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

export default function DriverDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

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
        <button
          onClick={() => navigate(`/drivers/${driver.id}/edit`)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PencilIcon className="h-5 w-5 mr-2" />
          Edit Driver
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Driver Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                        ? 'bg-green-100 text-green-800'
                        : driver.status === 'on_leave'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
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
                    {new Date(driver.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Trip History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h2>
            <TripHistory trips={tripHistory?.trips || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
