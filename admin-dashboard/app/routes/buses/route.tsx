import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TruckIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import busService from '../../lib/api/busService';
import type { Bus, BusFilters } from '../../lib/api/types';
import routeService from '../../lib/api/routeService';
import toast from 'react-hot-toast';

export default function BusesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ busId: string; busNumber: string } | null>(null);
  // Initialize statusFilter from URL params
  const initialStatus = (searchParams.get('status') || 'all').toLowerCase().trim();
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [routeFilter, setRouteFilter] = useState<string>('all');

  // Read URL parameters on mount and when they change
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const onRouteParam = searchParams.get('on_route');
    
    console.log('🔍 URL params changed:', { statusParam, onRouteParam });
    
    if (statusParam) {
      // Handle multiple status values (e.g., "maintenance,emergency")
      if (statusParam.includes(',')) {
        const firstStatus = statusParam.split(',')[0].toLowerCase().trim();
        setStatusFilter(firstStatus);
        console.log('✅ Set statusFilter to:', firstStatus);
      } else {
        const normalizedStatus = statusParam.toLowerCase().trim();
        setStatusFilter(normalizedStatus);
        console.log('✅ Set statusFilter to:', normalizedStatus);
      }
    } else {
      // If no status param, reset to 'all'
      setStatusFilter('all');
      console.log('✅ Reset statusFilter to: all');
    }
    
    // Reset page when filter changes
    setPage(1);
    
    // Note: on_route filter would need backend support, for now we'll just use status
    // If on_route is true, we might want to show active buses that have a route assigned
    if (onRouteParam === 'true' && statusParam === 'active') {
      // This would require backend support for filtering buses with assigned routes
      // For now, we'll just keep the active filter
    }
  }, [searchParams]);

  // Fetch buses - queryKey includes statusFilter so it auto-refetches when filter changes
  // Use optimistic loading: show UI immediately, load data in background
  const { data, isLoading, isFetching, refetch, isError, error } = useQuery({
    queryKey: ['buses', page, searchTerm, statusFilter, routeFilter],
    queryFn: async () => {
      try {
        console.log('🚀 Query executing with statusFilter:', statusFilter);
        
        const filters: BusFilters = {};
        if (statusFilter && statusFilter !== 'all') {
          // Handle multiple statuses (comma-separated) - use first one for now
          const status = statusFilter.includes(',') ? statusFilter.split(',')[0] : statusFilter;
          filters.status = status.toLowerCase().trim() as any;
          console.log('🔍 Filtering buses by status:', filters.status);
        } else {
          console.log('ℹ️ No status filter - showing all buses');
        }
        if (routeFilter && routeFilter !== 'all') {
          filters.route_id = routeFilter;
          console.log('🔍 Filtering buses by route:', routeFilter);
        }
        if (searchTerm) {
          filters.search = searchTerm;
          console.log('🔍 Filtering buses by search:', searchTerm);
        }

        console.log('📊 Fetching buses with filters:', filters);
        const result = await busService.getBuses(page, 20, filters);
        console.log('✅ Buses fetched:', result.buses.length, 'total:', result.total);
        console.log('📋 Buses data:', result.buses.map(b => ({ id: b.id, bus_number: b.bus_number, status: b.status })));
        
        // If we got 0 buses but filters are applied, log a warning
        if (result.buses.length === 0 && filters.status) {
          console.warn(`⚠️ No buses found with status "${filters.status}"`);
          console.warn('💡 This could mean:');
          console.warn('   1. No buses exist with this status in the database');
          console.warn('   2. RLS policies are blocking access');
          console.warn('   3. User is not authenticated as admin');
        }
        
        return result;
      } catch (err: any) {
        console.error('❌ Error in queryFn:', err);
        // Return empty result instead of throwing to prevent infinite loading
        return {
          buses: [],
          total: 0,
          current_page: 1,
          per_page: 20,
          last_page: 1,
        };
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: true, // Always enabled
    staleTime: 10000, // Cache for 10 seconds (faster updates)
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch on window focus to get latest data
    retry: 1, // Retry once on failure
    // Optimistic loading: show cached data immediately, then update
    placeholderData: (previousData) => previousData,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Fetch routes for dropdown
  const { data: routesData } = useQuery({
    queryKey: ['routes', 'all', 'dropdown'],
    queryFn: async () => {
      try {
        // Fetch all routes without filters
        const result = await routeService.getRoutes(1, 100); // Get up to 100 routes
        console.log('✅ Routes fetched for dropdown:', result.routes.length);
        return result;
      } catch (error) {
        console.warn('⚠️ Failed to fetch routes:', error);
        return { routes: [], total: 0 };
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  const routes = routesData?.routes || [];

  // Delete bus mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: busService.deleteBus,
    onMutate: async (busId: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['buses'] });

      // Snapshot the previous value
      const previousBuses = queryClient.getQueryData(['buses', page, searchTerm, statusFilter]);

      // Optimistically update the cache - remove the bus immediately
      queryClient.setQueryData(['buses', page, searchTerm, statusFilter], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          buses: old.buses?.filter((b: Bus) => b.id !== busId) || [],
          total: Math.max(0, (old.total || 0) - 1),
        };
      });

      // Return a context object with the snapshotted value
      return { previousBuses };
    },
    onSuccess: (_, busId) => {
      // Invalidate all related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['routes', 'all'] });
      
      // Close confirmation dialog
      setDeleteConfirm(null);
      
      toast.success(`✅ Bus deleted successfully!`, {
        duration: 3000,
        icon: '🗑️',
      });
    },
    onError: (error: any, busId, context) => {
      // Rollback to the previous value on error
      if (context?.previousBuses) {
        queryClient.setQueryData(['buses', page, searchTerm, statusFilter], context.previousBuses);
      }
      
      toast.error(error.message || 'Failed to delete bus. Please try again.', {
        duration: 4000,
      });
      
      // Close confirmation dialog
      setDeleteConfirm(null);
    },
  });

  const handleDeleteClick = (busId: string) => {
    const bus = buses.find(b => b.id === busId);
    const busNumber = bus?.bus_number || 'Unknown';
    setDeleteConfirm({ busId, busNumber });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.busId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const getStatusColor = (status: Bus['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'emergency':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Optimistic data: use cached data if available, otherwise empty array
  const buses = data?.buses || [];
  const total = data?.total || 0;
  const lastPage = data?.last_page || 1;
  
  // Show UI immediately, even if data is loading
  const showContent = !isLoading || buses.length > 0;

  // Debug logging
  // Debug logging
  useEffect(() => {
    console.log('📊 Buses Page State:', {
      isLoading,
      isError,
      error: error?.message,
      totalBuses: buses.length,
      total: total,
      statusFilter,
      routeFilter,
      searchTerm,
      page,
      hasData: !!data,
    });
    
    if (data) {
      console.log('📋 Buses data received:', {
        buses: buses.map(b => ({ id: b.id, bus_number: b.bus_number, status: b.status })),
        totalBuses: buses.length,
        total: total,
        statusFilter: statusFilter,
      });
    }
  }, [data, buses, total, statusFilter, isLoading, isError, error, routeFilter, searchTerm, page]);

  // Get filter status for header
  const getFilterTitle = () => {
    if (statusFilter === 'active') return 'Active Buses';
    if (statusFilter === 'maintenance') return 'Buses in Maintenance';
    if (statusFilter === 'emergency') return 'Emergency Buses';
    if (statusFilter === 'inactive') return 'Inactive Buses';
    return 'All Buses';
  };

  const getFilterGradient = () => {
    if (statusFilter === 'active') return 'from-green-600 via-green-700 to-emerald-700';
    if (statusFilter === 'maintenance') return 'from-yellow-600 via-yellow-700 to-amber-700';
    if (statusFilter === 'emergency') return 'from-red-600 via-red-700 to-rose-700';
    if (statusFilter === 'inactive') return 'from-gray-600 via-gray-700 to-slate-700';
    return 'from-blue-600 via-blue-700 to-indigo-700';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Gradient Header */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${getFilterGradient()} p-8 text-white shadow-xl`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <TruckIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{getFilterTitle()}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <p className="text-white/90 text-lg">
                      {total} {total === 1 ? 'bus' : 'buses'} in your fleet
                    </p>
                    {statusFilter === 'active' && buses.filter(b => b.current_latitude && b.current_longitude).length > 0 && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                        <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                        <span className="text-white font-semibold text-sm">
                          {buses.filter(b => b.current_latitude && b.current_longitude).length} Online
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/buses/new')}
              className="hidden md:flex items-center px-6 py-3 bg-white text-blue-700 rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 active:scale-95"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Bus
            </button>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Mobile Add Button */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => navigate('/buses/new')}
          className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg font-semibold"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Bus
        </button>
      </div>

      {/* Filters - Enhanced Design */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by bus number, license plate..."
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
                const newStatus = e.target.value.toLowerCase().trim();
                setStatusFilter(newStatus);
                setPage(1);
                // Update URL to reflect the filter
                if (newStatus === 'all') {
                  setSearchParams({}, { replace: true });
                } else {
                  setSearchParams({ status: newStatus }, { replace: true });
                }
                console.log('🔄 Status filter changed to:', newStatus);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          {/* Route Filter */}
          <div>
            <select
              value={routeFilter}
              onChange={(e) => {
                const newRoute = e.target.value;
                setRouteFilter(newRoute);
                setPage(1);
                console.log('🔄 Route filter changed to:', newRoute);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Routes</option>
              {routes.length > 0 ? (
                routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name} {route.status === 'active' ? '✓' : ''}
                  </option>
                ))
              ) : (
                <option disabled>Loading routes...</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Buses Grid - Modern Card Layout - Optimistic Loading */}
      <div>
        {/* Show subtle loading indicator only when fetching (not blocking UI) */}
        {isFetching && !data && (
          <div className="mb-4 flex items-center justify-center py-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading buses...</span>
            </div>
          </div>
        )}
        
        {isError ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-red-200">
            <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
              <TruckIcon className="h-12 w-12 text-red-400" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-red-900">Error loading buses</h3>
            <p className="mt-2 text-sm text-red-600 mb-6">
              {error?.message || 'Failed to load buses. Please try again.'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retry →
            </button>
          </div>
        ) : buses.length === 0 && !isLoading ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
              <TruckIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-900">No buses found</h3>
            <p className="mt-2 text-sm text-gray-500 mb-6">
              {statusFilter !== 'all' 
                ? `No buses with status "${statusFilter}" found. Try showing all buses.`
                : 'Get started by creating a new bus.'}
            </p>
            {statusFilter !== 'all' && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSearchParams({}, { replace: true });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Show all buses →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.map((bus, index) => {
              // Determine if bus is online (has recent location update)
              const isOnline = bus.status === 'active' && bus.current_latitude && bus.current_longitude;
              const hasLocation = !!(bus.current_latitude && bus.current_longitude);
              
              return (
                <div
                  key={bus.id}
                  className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Professional Status Bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${
                    bus.status === 'active' ? 'from-emerald-400 via-green-500 to-emerald-600' :
                    bus.status === 'maintenance' ? 'from-amber-400 via-yellow-500 to-amber-600' :
                    bus.status === 'emergency' ? 'from-rose-400 via-red-500 to-rose-600' :
                    'from-gray-400 via-gray-500 to-gray-600'
                  } ${isOnline ? 'animate-pulse' : ''}`}></div>
                  
                  <div className="p-6">
                    {/* Header with Online Indicator */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`relative p-3.5 rounded-xl shadow-lg transition-all duration-300 ${
                          bus.status === 'active' ? 'bg-gradient-to-br from-green-400 to-emerald-600' :
                          bus.status === 'maintenance' ? 'bg-gradient-to-br from-amber-400 to-yellow-600' :
                          bus.status === 'emergency' ? 'bg-gradient-to-br from-rose-400 to-red-600' :
                          'bg-gradient-to-br from-gray-400 to-gray-600'
                        }`}>
                          <TruckIcon className="h-6 w-6 text-white" />
                          {/* Online Pulse Indicator */}
                          {isOnline && (
                            <>
                              <div className="absolute inset-0 rounded-xl bg-green-400 animate-ping opacity-75"></div>
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                            </>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold text-gray-900 truncate">{bus.bus_number}</h3>
                            {isOnline && (
                              <span className="flex items-center space-x-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                <span>Online</span>
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 capitalize mt-0.5">{bus.bus_type || 'Standard'}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide shadow-sm ${getStatusColor(bus.status)}`}
                      >
                        {bus.status}
                      </span>
                    </div>

                    {/* Professional Details Grid */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">License Plate</span>
                        <span className="font-bold text-gray-900 text-base tracking-wider">{bus.license_plate}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Capacity</span>
                        <span className="font-semibold text-gray-900">{bus.capacity} seats</span>
                      </div>
                      <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Route</span>
                        <span className={`font-semibold ${bus.route_name ? 'text-blue-600' : 'text-gray-400'}`}>
                          {bus.route_name || 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Driver</span>
                        <span className={`font-semibold ${bus.driver_name ? 'text-gray-900' : 'text-gray-400'}`}>
                          {bus.driver_name || 'Unassigned'}
                        </span>
                      </div>
                      {hasLocation && (
                        <div className="flex items-center justify-between text-sm py-2 bg-blue-50 rounded-lg px-3 -mx-3">
                          <span className="text-blue-600 font-medium flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1.5" />
                            Location
                          </span>
                          <span className="font-mono text-xs text-blue-700">
                            {bus.current_latitude?.toFixed(4)}, {bus.current_longitude?.toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Professional Action Buttons */}
                    <div className="flex space-x-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/buses/${bus.id}`)}
                        className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
                      >
                        <EyeIcon className="h-4 w-4 mr-1.5" />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/buses/${bus.id}/edit`)}
                        className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
                      >
                        <PencilIcon className="h-4 w-4 mr-1.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(bus.id)}
                        disabled={deleteMutation.isPending}
                        className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed relative"
                        title="Delete Bus"
                      >
                        {deleteMutation.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                    bus.status === 'active' ? 'bg-gradient-to-br from-green-500/5 to-emerald-500/5' :
                    bus.status === 'maintenance' ? 'bg-gradient-to-br from-amber-500/5 to-yellow-500/5' :
                    'bg-gradient-to-br from-gray-500/5 to-gray-500/5'
                  }`}></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {buses.length > 0 && lastPage > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
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
          </div>
        )}
      </div>

      {/* Professional Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-rose-50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Bus</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete bus <span className="font-semibold text-gray-900">"{deleteConfirm.busNumber}"</span>?
              </p>
              <p className="text-sm text-gray-500">
                This will permanently remove the bus from your fleet. All associated data will be lost.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex items-center justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleteMutation.isPending}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {deleteMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4" />
                    <span>Delete Bus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
