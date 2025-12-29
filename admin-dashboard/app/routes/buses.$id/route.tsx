import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import busService from '../../lib/api/busService';
import StatusBadge from '../../components/buses/StatusBadge';

export default function BusViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch bus details from Laravel API
  const { data: bus, isLoading, error, refetch } = useQuery({
    queryKey: ['bus', id],
    queryFn: async () => {
      if (!id) throw new Error('Bus ID is required');
      return await busService.getBusById(id);
    },
    enabled: !!id,
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bus details...</p>
        </div>
      </div>
    );
  }

  if (error || !bus) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center mb-6">
          <TruckIcon className="h-12 w-12 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Bus Not Found</h3>
        <p className="text-gray-500 mb-6">
          {error instanceof Error ? error.message : 'The bus you\'re looking for doesn\'t exist.'}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/buses')}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Back to Buses
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (bus.status) {
      case 'active':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'maintenance':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'emergency':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusGradient = () => {
    switch (bus.status) {
      case 'active':
        return 'from-green-600 via-green-700 to-emerald-700';
      case 'maintenance':
        return 'from-amber-600 via-yellow-700 to-amber-700';
      case 'emergency':
        return 'from-red-600 via-rose-700 to-red-700';
      default:
        return 'from-gray-600 via-gray-700 to-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${getStatusGradient()} p-8 text-white shadow-xl`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/buses')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <TruckIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Bus Details</h1>
                  <p className="text-white/90 text-lg mt-1">Bus #{bus.bus_number}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/buses/${bus.id}/edit`)}
              className="flex items-center px-6 py-3 bg-white text-blue-700 rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 active:scale-95"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit Bus
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Bus Information */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${
              bus.status === 'active' ? 'from-green-400 via-green-500 to-emerald-600' :
              bus.status === 'maintenance' ? 'from-amber-400 via-yellow-500 to-amber-600' :
              bus.status === 'emergency' ? 'from-rose-400 via-red-500 to-rose-600' :
              'from-gray-400 via-gray-500 to-gray-600'
            }`}></div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <TruckIcon className="h-6 w-6 mr-2 text-blue-600" />
                Bus Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <TruckIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">Bus Number</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{bus.bus_number}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">License Plate</span>
                  </div>
                  <span className="font-bold text-gray-900 tracking-wider">{bus.license_plate}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <TruckIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">Bus Type</span>
                  </div>
                  <span className="font-semibold text-gray-900 capitalize">{bus.bus_type}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">Capacity</span>
                  </div>
                  <span className="font-semibold text-gray-900">{bus.capacity} seats</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon()}
                    <span className="text-sm font-medium text-gray-600">Status</span>
                  </div>
                  <StatusBadge status={bus.status} />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">Assigned Route</span>
                  </div>
                  <span className={`font-semibold ${bus.route_name ? 'text-blue-600' : 'text-gray-400'}`}>
                    {bus.route_name || 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">Assigned Driver</span>
                  </div>
                  <span className={`font-semibold ${bus.driver_name ? 'text-gray-900' : 'text-gray-400'}`}>
                    {bus.driver_name || 'Unassigned'}
                  </span>
                </div>

                {bus.current_latitude && bus.current_longitude && (
                  <div className="py-3 bg-blue-50 rounded-lg px-4 -mx-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Current Location</span>
                      </div>
                      <span className="font-mono text-xs text-blue-700">
                        {bus.current_latitude.toFixed(4)}, {bus.current_longitude.toFixed(4)}
                      </span>
                    </div>
                    {bus.last_location_update && (
                      <p className="text-xs text-blue-500 mt-1">
                        Updated: {new Date(bus.last_location_update).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">Created At</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">
                    {new Date(bus.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Additional Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600"></div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-6 w-6 mr-2 text-blue-600" />
                Location Information
              </h2>
              {bus.current_latitude && bus.current_longitude ? (
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPinIcon className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-700 font-medium">Location Tracking Active</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {bus.current_latitude.toFixed(4)}, {bus.current_longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No location data available</p>
                    <p className="text-sm text-gray-400 mt-1">Location will appear when bus starts tracking</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
