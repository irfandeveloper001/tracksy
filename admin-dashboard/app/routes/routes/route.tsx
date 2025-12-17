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
} from '@heroicons/react/24/outline';
import routeService, { Route, RouteFilters } from '../../lib/api/routeService';
import toast from 'react-hot-toast';

export default function RoutesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  // Initialize statusFilter from URL params
  const initialStatus = searchParams.get('status') || 'all';
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);

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

  const getFilterGradient = () => {
    if (statusFilter === 'active') return 'from-purple-600 via-purple-700 to-indigo-700';
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
                  <MapIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{getFilterTitle()}</h1>
                  <p className="text-white/90 text-lg mt-1">
                    {total} {total === 1 ? 'route' : 'routes'} configured
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/routes/new')}
              className="hidden md:flex items-center px-6 py-3 bg-white text-blue-700 rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 active:scale-95"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Route
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
          onClick={() => navigate('/routes/new')}
          className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg font-semibold"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
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

      {/* Filters - Enhanced Design */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                      onClick={() => navigate(`/routes/${route.id}`)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/routes/${route.id}/edit`)}
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
