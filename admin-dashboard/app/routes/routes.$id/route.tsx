import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  MapIcon,
  MapPinIcon,
  ClockIcon,
  PencilIcon,
  PlusIcon,
  TruckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import routeService, { Stop } from '../../lib/api/routeService';
import RouteMap from '../../components/routes/RouteMap';
import StopsList from '../../components/routes/StopsList';
import toast from 'react-hot-toast';

export default function RouteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch route details
  const { data: route, isLoading, refetch } = useQuery({
    queryKey: ['route', id],
    queryFn: () => routeService.getRouteById(id!),
    enabled: !!id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch route stops
  const { data: stops = [], refetch: refetchStops } = useQuery({
    queryKey: ['route-stops', id],
    queryFn: () => routeService.getRouteStops(id!),
    enabled: !!id,
  });

  // Delete stop mutation
  const deleteStopMutation = useMutation({
    mutationFn: (stopId: string) => routeService.deleteStop(id!, stopId),
    onSuccess: () => {
      toast.success('Stop deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['route-stops', id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete stop');
    },
  });

  const handleDeleteStop = (stopId: string) => {
    if (window.confirm('Are you sure you want to delete this stop?')) {
      deleteStopMutation.mutate(stopId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading route details...</span>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Route not found</p>
        <button
          onClick={() => navigate('/routes')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Routes
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
            onClick={() => navigate('/routes')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{route.name}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {route.start_location} → {route.end_location}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/routes/${route.id}/stops/new`)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Stop
          </button>
          <button
            onClick={() => navigate(`/routes/${route.id}/edit`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Route
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <MapPinIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Stops</p>
              <p className="text-2xl font-bold text-gray-900">{stops.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <MapIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Distance</p>
              <p className="text-2xl font-bold text-gray-900">
                {route.distance ? `${route.distance} km` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {route.estimated_duration ? `${route.estimated_duration} min` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Buses</p>
              <p className="text-2xl font-bold text-gray-900">
                {route.active_buses_count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Route Info & Stops */}
        <div className="lg:col-span-1 space-y-6">
          {/* Route Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Start Location</p>
                <p className="font-medium text-gray-900">{route.start_location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Location</p>
                <p className="font-medium text-gray-900">{route.end_location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    route.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {route.status}
                </span>
              </div>
              {route.student_count !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Students</p>
                  <p className="font-medium text-gray-900">{route.student_count}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stops List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stops</h2>
            <StopsList
              stops={stops}
              onDelete={handleDeleteStop}
              onEdit={(stopId) => navigate(`/routes/${route.id}/stops/${stopId}/edit`)}
            />
          </div>
        </div>

        {/* Right Column - Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Map</h2>
            <RouteMap
              routeId={route.id}
              routeName={route.name}
              startLocation={{
                name: route.start_location,
                lat: route.start_latitude,
                lng: route.start_longitude,
              }}
              endLocation={{
                name: route.end_location,
                lat: route.end_latitude,
                lng: route.end_longitude,
              }}
              stops={stops.map((stop) => ({
                id: stop.id,
                name: stop.name,
                lat: stop.latitude,
                lng: stop.longitude,
                sequence: stop.sequence,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

