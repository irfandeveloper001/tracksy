import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  TruckIcon,
  UserIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import tripService from '../../lib/api/tripService';

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch trip details
  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripService.getTripById(id!),
    enabled: !!id,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading trip details...</span>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Trip not found</p>
        <button
          onClick={() => navigate('/trips')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Trips
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/trips')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trip Details</h1>
          <p className="mt-1 text-sm text-gray-600">Trip #{String(trip.id).substring(0, 8)}</p>
        </div>
      </div>

      {/* Trip Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mt-1 ${getStatusColor(
                    trip.status
                  )}`}
                >
                  {trip.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Student Count</p>
                <p className="font-medium text-gray-900 mt-1">{trip.student_count}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Time</p>
                <p className="font-medium text-gray-900 mt-1">
                  {trip.start_time ? new Date(trip.start_time).toLocaleString() : 'N/A'}
                </p>
              </div>
              {trip.end_time && (
                <div>
                  <p className="text-sm text-gray-500">End Time</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {trip.end_time ? new Date(trip.end_time).toLocaleString() : 'N/A'}
                  </p>
                </div>
              )}
              {trip.duration && (
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900 mt-1">{trip.duration} minutes</p>
                </div>
              )}
            </div>
          </div>

          {/* Locations */}
          {(trip.start_location || trip.end_location) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Locations</h2>
              <div className="space-y-3">
                {trip.start_location && (
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Start Location</p>
                      <p className="font-medium text-gray-900">{trip.start_location}</p>
                    </div>
                  </div>
                )}
                {trip.end_location && (
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">End Location</p>
                      <p className="font-medium text-gray-900">{trip.end_location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Route Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>
            <div className="space-y-4">
              {trip.route_name && (
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Route</p>
                    <p className="font-medium text-gray-900">{trip.route_name}</p>
                  </div>
                </div>
              )}
              {trip.bus_number && (
                <div className="flex items-center space-x-3">
                  <TruckIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Bus</p>
                    <p className="font-medium text-gray-900">{trip.bus_number}</p>
                  </div>
                </div>
              )}
              {trip.driver_name && (
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Driver</p>
                    <p className="font-medium text-gray-900">{trip.driver_name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Students</p>
                  <p className="font-medium text-gray-900">{trip.student_count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
