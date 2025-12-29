import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  MapIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  FunnelIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import routeService from '../../lib/api/routeService';
import type { Route } from '../../lib/api/routeService';
import type { RouteFilters } from '../../lib/api/routeService';
import toast from 'react-hot-toast';

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

export default function RoutesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  // Initialize statusFilter from URL params
  const initialStatus = searchParams.get('status') || 'all';
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read URL parameters on mount and when they change
  useEffect(() => {
    const statusParam = searchParams.get('status');
    
    if (statusParam) {
      setStatusFilter(statusParam);
    } else {
      setStatusFilter('all');
    }
    
    // Reset page when filter changes
    setPage(1);
  }, [searchParams, setSearchParams]);

  // Fetch routes - queryKey includes statusFilter so it auto-refetches when filter changes
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['routes', page, searchTerm, statusFilter],
    queryFn: () => {
      console.log('🚀 Routes query executing with statusFilter:', statusFilter);
      
      const filters: RouteFilters = {};
      if (statusFilter && statusFilter !== 'all') {
        filters.status = statusFilter;
        console.log('🔍 Filtering routes by status:', statusFilter);
      }
      if (searchTerm) filters.search = searchTerm;

      console.log('📊 Fetching routes with filters:', filters);
      const result = routeService.getRoutes(page, 20, filters);
      console.log('✅ Routes fetched:', result);
      return result;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: true, // Always enabled
    staleTime: 0, // Always consider data stale to force refetch
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Force refetch when statusFilter changes from URL
  useEffect(() => {
    if (statusFilter) {
      refetch();
    }
  }, [statusFilter, refetch]);

  // Delete route mutation
  const deleteMutation = useMutation({
    mutationFn: routeService.deleteRoute,
    onSuccess: () => {
      toast.success('Route deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete route');
    },
  });

  const handleDelete = (routeId: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      deleteMutation.mutate(routeId);
    }
  };

  // Fetch selected route details when modal opens
  const { data: selectedRouteData, isLoading: isLoadingRoute } = useQuery({
    queryKey: ['route', selectedRoute?.id],
    queryFn: async () => {
      if (!selectedRoute?.id) return null;
      return await routeService.getRouteById(selectedRoute.id);
    },
    enabled: !!selectedRoute?.id && !isEditMode,
  });

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
        start_location: currentRoute.start_point || currentRoute.origin || currentRoute.start_location || '',
        end_location: currentRoute.end_point || currentRoute.destination || currentRoute.end_location || '',
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
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', selectedRoute?.id] });
      setIsEditMode(false);
      setIsSubmitting(false);
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

  const handleViewRoute = (route: Route) => {
    setSelectedRoute(route);
    setIsEditMode(false);
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setIsEditMode(true);
  };

  const handleCloseModal = () => {
    setSelectedRoute(null);
    setIsEditMode(false);
  };

  const getStatusColor = (status: Route['status']) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const routes = data?.routes || [];
  const total = data?.total || 0;
  const lastPage = data?.last_page || 1;

  // Get filter status for header
  const getFilterTitle = () => {
    if (statusFilter === 'active') return 'Active Routes';
    if (statusFilter === 'inactive') return 'Inactive Routes';
    return 'All Routes';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-slate-600 shadow-sm ring-1 ring-slate-200">
            <MapIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{getFilterTitle()}</h1>
            <p className="text-sm text-slate-500">
              {total} {total === 1 ? 'route' : 'routes'} configured
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/routes/new')}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Route
        </button>
      </div>

      {/* Statistics Cards - Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Routes</p>
              <p className="text-3xl font-bold text-blue-900">{total}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <MapIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Active Routes</p>
              <p className="text-3xl font-bold text-green-900">
                {routes.filter((r) => r.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <MapPinIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Total Stops</p>
              <p className="text-3xl font-bold text-purple-900">
                {routes.reduce((sum, r) => sum + (r.stops_count || 0), 0)}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <MapPinIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm border border-yellow-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-yellow-900">
                {routes.reduce((sum, r) => sum + (r.student_count || 0), 0)}
              </p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-xl">
              <MapPinIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by route name, start location, end location..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                const newStatus = e.target.value;
                setStatusFilter(newStatus);
                setPage(1);
                // Update URL to reflect the filter
                if (newStatus === 'all') {
                  setSearchParams({}, { replace: true });
                } else {
                  setSearchParams({ status: newStatus }, { replace: true });
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Routes Grid - Modern Card Layout */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <span className="ml-3 text-gray-600 mt-4 block">Loading routes...</span>
            </div>
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
              <MapIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-900">No routes found</h3>
            <p className="mt-2 text-sm text-gray-500 mb-6">
              {statusFilter !== 'all' 
                ? `No routes with status "${statusFilter}" found.`
                : 'Get started by creating a new route.'}
            </p>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Show all routes →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route, index) => (
              <div
                key={route.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Card Header with Status */}
                <div className={`h-2 bg-gradient-to-r ${
                  route.status === 'active' ? 'from-purple-500 to-indigo-500' : 'from-gray-400 to-gray-500'
                }`}></div>
                
                <div className="p-6">
                  {/* Route Name & Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl ${
                        route.status === 'active' ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <MapIcon className={`h-6 w-6 ${
                          route.status === 'active' ? 'text-purple-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{route.name}</h3>
                        <span
                          className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(route.status)}`}
                        >
                          {route.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route Path */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">{route.start_location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">{route.end_location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-blue-600 font-medium mb-1">Stops</div>
                      <div className="text-lg font-bold text-blue-900">{route.stops_count || 0}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-green-600 font-medium mb-1">Buses</div>
                      <div className="text-lg font-bold text-green-900">{route.active_buses_count || 0}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-xs text-purple-600 font-medium mb-1">Students</div>
                      <div className="text-lg font-bold text-purple-900">{route.student_count || 0}</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-xs text-yellow-600 font-medium mb-1">Distance</div>
                      <div className="text-lg font-bold text-yellow-900">
                        {route.distance ? `${route.distance} km` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  {route.estimated_duration && (
                    <div className="mb-4 text-sm">
                      <span className="text-gray-500">Estimated Duration: </span>
                      <span className="font-semibold text-gray-900">{route.estimated_duration} minutes</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleViewRoute(route)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditRoute(route)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors font-medium text-sm"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Route Details/Edit Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className={`px-6 py-5 border-b border-gray-200 bg-gradient-to-r ${
              currentRoute?.status === 'active' ? 'from-purple-50 to-indigo-50' : 'from-gray-50 to-slate-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${
                    currentRoute?.status === 'active' ? 'bg-purple-100' : 'bg-gray-100'
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
                    onClick={handleCloseModal}
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
                          <span className="text-sm font-medium text-gray-600 flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                            Start Point
                          </span>
                          <span className="font-semibold text-gray-900">
                            {currentRoute.start_point || currentRoute.origin || currentRoute.start_location || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600 flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                            End Point
                          </span>
                          <span className="font-semibold text-gray-900">
                            {currentRoute.end_point || currentRoute.destination || currentRoute.end_location || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {currentRoute.distance && (
                          <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Distance</span>
                            <span className="font-semibold text-gray-900">{currentRoute.distance} km</span>
                          </div>
                        )}
                        {currentRoute.estimated_duration && (
                          <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600 flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                              Duration
                            </span>
                            <span className="font-semibold text-gray-900">{currentRoute.estimated_duration} min</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Stops</span>
                          <span className="font-semibold text-gray-900">{currentRoute.stops_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Active Buses</span>
                          <span className="font-semibold text-gray-900">{currentRoute.active_buses_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Students</span>
                          <span className="font-semibold text-gray-900">{currentRoute.student_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        {/* Pagination */}
        {!isLoading && routes.length > 0 && lastPage > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
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
      </div>
    </div>
  );
}
