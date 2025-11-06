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
} from '@heroicons/react/24/outline';
import busService from '../../lib/api/busService';
import BusMap from '../../components/buses/BusMap';
import TripHistory from '../../components/buses/TripHistory';
import StatusBadge from '../../components/buses/StatusBadge';

export default function BusDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch bus details
  const { data: bus, isLoading, refetch } = useQuery({
    queryKey: ['bus', id],
    queryFn: () => busService.getBusById(id!),
    enabled: !!id,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });

  // Fetch trip history
  const { data: tripHistory } = useQuery({
    queryKey: ['bus-trips', id],
    queryFn: () => busService.getBusTripHistory(id!, 1, 10),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading bus details...</span>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bus not found</p>
        <button
          onClick={() => navigate('/buses')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Buses
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
            onClick={() => navigate('/buses')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bus Details</h1>
            <p className="mt-1 text-sm text-gray-600">Bus #{bus.bus_number}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/buses/${bus.id}/edit`)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PencilIcon className="h-5 w-5 mr-2" />
          Edit Bus
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Bus Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Bus Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bus Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <TruckIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Bus Number</p>
                  <p className="font-medium text-gray-900">{bus.bus_number}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">License Plate</p>
                  <p className="font-medium text-gray-900">{bus.license_plate}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <TruckIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Bus Type</p>
                  <p className="font-medium text-gray-900 capitalize">{bus.bus_type}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-medium text-gray-900">{bus.capacity} seats</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={bus.status} />
                  </div>
                </div>
              </div>

              {bus.route_name && (
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Assigned Route</p>
                    <p className="font-medium text-gray-900">{bus.route_name}</p>
                  </div>
                </div>
              )}

              {bus.driver_name && (
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Assigned Driver</p>
                    <p className="font-medium text-gray-900">{bus.driver_name}</p>
                  </div>
                </div>
              )}

              {bus.last_location_update && (
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Location Update</p>
                    <p className="font-medium text-gray-900">
                      {new Date(bus.last_location_update).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium text-gray-900">
                    {new Date(bus.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Map & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Map */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Real-time Location</h2>
            <BusMap
              busId={bus.id}
              busNumber={bus.bus_number}
              currentLocation={
                bus.current_latitude && bus.current_longitude
                  ? { lat: bus.current_latitude, lng: bus.current_longitude }
                  : undefined
              }
            />
          </div>

          {/* Trip History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h2>
            <TripHistory trips={tripHistory?.trips || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
