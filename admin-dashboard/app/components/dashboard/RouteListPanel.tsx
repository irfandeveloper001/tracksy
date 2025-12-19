import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import routeService from '../../lib/api/routeService';
import type { Route } from '../../lib/api/routeService';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

const routeSchema = z.object({
  name: z.string().min(1, 'Route name is required'),
  start_location: z.string().min(1, 'Start location is required'),
  end_location: z.string().min(1, 'End location is required'),
  start_point: z.string().optional(),
  end_point: z.string().optional(),
  distance: z.number().optional(),
  estimated_duration: z.number().optional(),
  status: z.enum(['active', 'inactive']),
});

type RouteFormData = z.infer<typeof routeSchema>;

interface RouteListPanelProps {
  defaultFilter?: 'active' | 'inactive' | 'all';
}

export default function RouteListPanel({ defaultFilter = 'all' }: RouteListPanelProps) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>(defaultFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch routes with filters
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-routes', statusFilter, searchTerm],
    queryFn: async () => {
      const filters: any = {};
      if (statusFilter && statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      return await routeService.getRoutes(1, 50, filters);
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Fetch selected route details
  const { data: selectedRouteData, isLoading: isLoadingRoute } = useQuery({
    queryKey: ['route', selectedRoute?.id],
    queryFn: async () => {
      if (!selectedRoute?.id) return null;
      return await routeService.getRouteById(selectedRoute.id);
    },
    enabled: !!selectedRoute?.id && !isEditMode,
  });

  const routes = data?.routes || [];
  const total = data?.total || 0;
  const currentRoute = selectedRouteData || selectedRoute;

  // Form for editing
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
  });

  // Populate form when route data loads in edit mode
  useEffect(() => {
    if (currentRoute && isEditMode) {
      reset({
        name: currentRoute.name,
        start_location: currentRoute.start_point || currentRoute.origin || '',
        end_location: currentRoute.end_point || currentRoute.destination || '',
        start_point: currentRoute.start_point || currentRoute.origin || '',
        end_point: currentRoute.end_point || currentRoute.destination || '',
        distance: currentRoute.distance || undefined,
        estimated_duration: currentRoute.estimated_duration || undefined,
        status: (currentRoute.status || (currentRoute.is_active ? 'active' : 'inactive')) as 'active' | 'inactive',
      });
    }
  }, [currentRoute, isEditMode, reset]);

  // Update route mutation
  const updateMutation = useMutation({
    mutationFn: (data: RouteFormData) => {
      if (!selectedRoute?.id) throw new Error('Route ID is required');
      return routeService.updateRoute(selectedRoute.id, data);
    },
    onSuccess: () => {
      toast.success('✅ Route updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['dashboard-routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', selectedRoute?.id] });
      setIsEditMode(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update route');
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: RouteFormData) => {
    setIsSubmitting(true);
    updateMutation.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'active') {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    return <XCircleIcon className="h-5 w-5 text-gray-500" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') {
      return 'border-l-green-500 bg-green-50/50';
    }
    return 'border-l-gray-500 bg-gray-50/50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <MapIcon className="h-6 w-6 mr-2 text-purple-600" />
              Route List
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {total} {total === 1 ? 'route' : 'routes'} found
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500 font-medium">Live</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by route name, start, end..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Route List */}
      <div className="max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading routes...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center mb-6">
              <MapIcon className="h-12 w-12 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Routes</h3>
            <p className="text-gray-500">Failed to fetch routes. Please try again.</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center mb-6">
              <MapIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Routes Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters or search term.'
                : 'Get started by creating a new route.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {routes.map((route, index) => (
              <div
                key={route.id}
                className={`p-4 border-l-4 hover:bg-gray-50 transition-colors cursor-pointer ${getStatusColor(route.status || 'inactive')}`}
                onClick={() => {
                  setSelectedRoute(route);
                  setIsEditMode(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {getStatusIcon(route.status || 'inactive')}
                    </div>

                    {/* Route Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-bold text-gray-900 truncate">
                          {route.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          route.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {route.status || 'inactive'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <span className="truncate">
                            {route.start_point || route.origin || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <span className="truncate">
                            {route.end_point || route.destination || 'N/A'}
                          </span>
                        </div>
                        {route.distance && (
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4 text-gray-400" />
                            <span>{route.distance} km</span>
                          </div>
                        )}
                        {route.estimated_duration && (
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4 text-gray-400" />
                            <span>{route.estimated_duration} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoute(route);
                        setIsEditMode(false);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoute(route);
                        setIsEditMode(true);
                      }}
                      className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                      title="Edit Route"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {routes.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {routes.length} of {total} routes
            </span>
          </div>
        </div>
      )}

      {/* Route Details/Edit Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className={`px-6 py-5 border-b border-gray-200 bg-gradient-to-r ${
              currentRoute?.status === 'active' ? 'from-green-50 to-emerald-50' : 'from-gray-50 to-slate-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${
                    currentRoute?.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <MapIcon className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {isEditMode ? 'Edit Route' : 'Route Details'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentRoute?.name || 'Loading...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditMode && (
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedRoute(null);
                      setIsEditMode(false);
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingRoute && !currentRoute ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : isEditMode ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Route Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('status')}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="inactive">Inactive</option>
                        <option value="active">Active</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('start_location')}
                        type="text"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                          errors.start_location ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.start_location && (
                        <p className="mt-2 text-sm text-red-600">{errors.start_location.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('end_location')}
                        type="text"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                          errors.end_location ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.end_location && (
                        <p className="mt-2 text-sm text-red-600">{errors.end_location.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Distance (km) - Optional
                      </label>
                      <input
                        {...register('distance', { valueAsNumber: true })}
                        type="number"
                        step="0.1"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Estimated Duration (minutes) - Optional
                      </label>
                      <input
                        {...register('estimated_duration', { valueAsNumber: true })}
                        type="number"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-semibold disabled:opacity-50"
                    >
                      {isSubmitting ? 'Updating...' : 'Update Route'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {currentRoute && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Route Name</span>
                          <span className="font-bold text-gray-900">{currentRoute.name}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            currentRoute.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {currentRoute.status || 'inactive'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Start Point</span>
                          <span className="font-semibold text-gray-900">
                            {currentRoute.start_point || currentRoute.origin || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">End Point</span>
                          <span className="font-semibold text-gray-900">
                            {currentRoute.end_point || currentRoute.destination || 'N/A'}
                          </span>
                        </div>
                        {currentRoute.distance && (
                          <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Distance</span>
                            <span className="font-semibold text-gray-900">{currentRoute.distance} km</span>
                          </div>
                        )}
                        {currentRoute.estimated_duration && (
                          <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Duration</span>
                            <span className="font-semibold text-gray-900">{currentRoute.estimated_duration} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
