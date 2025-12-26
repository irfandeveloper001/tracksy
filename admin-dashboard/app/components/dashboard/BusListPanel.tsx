import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TruckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import busService from '../../lib/api/busService';
import routeService from '../../lib/api/routeService';
import userService from '../../lib/api/userService';
import type { Bus } from '../../lib/api/types';
import StatusBadge from '../buses/StatusBadge';
import toast from 'react-hot-toast';

const busSchema = z.object({
  bus_number: z.string().min(1, 'Bus number is required'),
  license_plate: z.string().min(1, 'License plate is required'),
  bus_type: z.enum(['standard', 'premium', 'luxury']),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(100),
  status: z.enum(['active', 'inactive', 'maintenance', 'emergency']),
  route_id: z.string().optional(),
  driver_id: z.string().optional(),
});

type BusFormData = z.infer<typeof busSchema>;

interface BusListPanelProps {
  defaultFilter?: 'active' | 'inactive' | 'maintenance' | 'emergency' | 'all';
}

export default function BusListPanel({ defaultFilter = 'all' }: BusListPanelProps) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>(defaultFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch buses with filters
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-buses', statusFilter, searchTerm],
    queryFn: async () => {
      const filters: any = {};
      if (statusFilter && statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      return await busService.getBuses(1, 50, filters);
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,
  });

  // Fetch routes and drivers for edit form
  const { data: routesData } = useQuery({
    queryKey: ['routes', 'all', 'dashboard'],
    queryFn: async () => {
      try {
        return await routeService.getRoutes(1, 100);
      } catch (error) {
        return { routes: [], total: 0 };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: driversData } = useQuery({
    queryKey: ['drivers', 'all', 'dashboard'],
    queryFn: async () => {
      try {
        return await userService.getDrivers(1, 100);
      } catch (error) {
        return { users: [], total: 0 };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch selected bus details
  const { data: selectedBusData, isLoading: isLoadingBus } = useQuery({
    queryKey: ['bus', selectedBus?.id],
    queryFn: async () => {
      if (!selectedBus?.id) return null;
      return await busService.getBusById(selectedBus.id);
    },
    enabled: !!selectedBus?.id && !isEditMode,
  });

  const buses = data?.buses || [];
  const total = data?.total || 0;
  const routes = routesData?.routes || [];
  const drivers = driversData?.users || [];
  const currentBus = selectedBusData || selectedBus;

  // Form for editing
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BusFormData>({
    resolver: zodResolver(busSchema),
  });

  // Populate form when bus data loads in edit mode
  useEffect(() => {
    if (currentBus && isEditMode) {
      reset({
        bus_number: currentBus.bus_number,
        license_plate: currentBus.license_plate,
        bus_type: currentBus.bus_type as 'standard' | 'premium' | 'luxury',
        capacity: currentBus.capacity,
        status: currentBus.status as 'active' | 'inactive' | 'maintenance' | 'emergency',
        route_id: currentBus.route_id || '',
        driver_id: currentBus.driver_id || '',
      });
    }
  }, [currentBus, isEditMode, reset]);

  // Update bus mutation
  const updateMutation = useMutation({
    mutationFn: (data: BusFormData) => {
      if (!selectedBus?.id) throw new Error('Bus ID is required');
      return busService.updateBus(selectedBus.id, data);
    },
    onSuccess: () => {
      toast.success('✅ Bus updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['dashboard-buses'] });
      queryClient.invalidateQueries({ queryKey: ['bus', selectedBus?.id] });
      setIsEditMode(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update bus');
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: BusFormData) => {
    setIsSubmitting(true);
    updateMutation.mutate(data);
  };

  const getStatusIcon = (status: Bus['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'maintenance':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'emergency':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Bus['status']) => {
    switch (status) {
      case 'active':
        return 'border-l-green-500 bg-gradient-to-r from-green-50/80 to-white/60';
      case 'maintenance':
        return 'border-l-yellow-500 bg-gradient-to-r from-yellow-50/80 to-white/60';
      case 'emergency':
        return 'border-l-red-500 bg-gradient-to-r from-red-50/80 to-white/60';
      default:
        return 'border-l-gray-500 bg-gradient-to-r from-gray-50/80 to-white/60';
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden hover:shadow-2xl transition-all duration-500">
      {/* Header */}
      <div className="relative p-6 border-b border-gray-200/70 bg-gradient-to-r from-blue-50 via-white/70 to-indigo-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_60%)] pointer-events-none"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <TruckIcon className="h-6 w-6 mr-2 text-blue-600" />
                Bus List
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {total} {total === 1 ? 'bus' : 'buses'} found
              </p>
            </div>
            <div className="flex items-center space-x-2 rounded-full bg-white/80 px-3 py-1 border border-blue-100 shadow-sm">
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
                placeholder="Search by bus number, license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300/80 rounded-lg bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300/80 rounded-lg bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bus List */}
      <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading buses...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center mb-6">
              <TruckIcon className="h-12 w-12 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Buses</h3>
            <p className="text-gray-500">Failed to fetch buses. Please try again.</p>
          </div>
        ) : buses.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center mb-6">
              <TruckIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Buses Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters or search term.'
                : 'Get started by creating a new bus.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 px-4 py-4">
            {buses.map((bus) => (
              <div
                key={bus.id}
                className={`group relative overflow-hidden p-4 rounded-xl border border-gray-200/60 border-l-4 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer ${getStatusColor(bus.status)}`}
                onClick={() => {
                  setSelectedBus(bus);
                  setIsEditMode(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {getStatusIcon(bus.status)}
                    </div>

                    {/* Bus Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-bold text-gray-900 truncate">
                          {bus.bus_number}
                        </h4>
                        <StatusBadge status={bus.status} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{bus.license_plate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TruckIcon className="h-4 w-4 text-gray-400" />
                          <span className="capitalize">{bus.bus_type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span>{bus.capacity} seats</span>
                        </div>
                        {bus.route_name && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <MapPinIcon className="h-4 w-4" />
                            <span className="truncate">{bus.route_name}</span>
                          </div>
                        )}
                      </div>
                      {bus.driver_name && (
                        <div className="text-xs text-gray-500 mt-1">
                          Driver: {bus.driver_name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBus(bus);
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
                        setSelectedBus(bus);
                        setIsEditMode(true);
                      }}
                      className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                      title="Edit Bus"
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

      {/* Footer with quick stats */}
      {buses.length > 0 && (
        <div className="p-4 bg-white/70 border-t border-gray-200/70 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {buses.length} of {total} buses
            </span>
          </div>
        </div>
      )}

      {/* Bus Details/Edit Modal */}
      {selectedBus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className={`px-6 py-5 border-b border-gray-200 bg-gradient-to-r ${
              currentBus?.status === 'active' ? 'from-green-50 to-emerald-50' :
              currentBus?.status === 'maintenance' ? 'from-amber-50 to-yellow-50' :
              currentBus?.status === 'emergency' ? 'from-red-50 to-rose-50' :
              'from-gray-50 to-slate-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${
                    currentBus?.status === 'active' ? 'bg-green-100' :
                    currentBus?.status === 'maintenance' ? 'bg-amber-100' :
                    currentBus?.status === 'emergency' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    <TruckIcon className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {isEditMode ? 'Edit Bus' : 'Bus Details'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentBus?.bus_number || 'Loading...'}
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
                      setSelectedBus(null);
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
              {isLoadingBus && !currentBus ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : isEditMode ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bus Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('bus_number')}
                        type="text"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.bus_number ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.bus_number && (
                        <p className="mt-2 text-sm text-red-600">{errors.bus_number.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        License Plate <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('license_plate')}
                        type="text"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.license_plate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.license_plate && (
                        <p className="mt-2 text-sm text-red-600">{errors.license_plate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bus Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('bus_type')}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                        <option value="luxury">Luxury</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Capacity <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('capacity', { valueAsNumber: true })}
                        type="number"
                        min="1"
                        max="100"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.capacity ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.capacity && (
                        <p className="mt-2 text-sm text-red-600">{errors.capacity.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('status')}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="inactive">Inactive</option>
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Assigned Route (Optional)
                      </label>
                      <select
                        {...register('route_id')}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">No Route Assigned</option>
                        {routes.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Assigned Driver (Optional)
                      </label>
                      <select
                        {...register('driver_id')}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">No Driver Assigned</option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name || driver.email || 'Unnamed Driver'}
                          </option>
                        ))}
                      </select>
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
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold disabled:opacity-50"
                    >
                      {isSubmitting ? 'Updating...' : 'Update Bus'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {currentBus && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Bus Number</span>
                          <span className="font-bold text-gray-900">{currentBus.bus_number}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">License Plate</span>
                          <span className="font-bold text-gray-900 tracking-wider">{currentBus.license_plate}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Bus Type</span>
                          <span className="font-semibold text-gray-900 capitalize">{currentBus.bus_type}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Capacity</span>
                          <span className="font-semibold text-gray-900">{currentBus.capacity} seats</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Status</span>
                          <StatusBadge status={currentBus.status} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Assigned Route</span>
                          <span className={`font-semibold ${currentBus.route_name ? 'text-blue-600' : 'text-gray-400'}`}>
                            {currentBus.route_name || 'Unassigned'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Assigned Driver</span>
                          <span className={`font-semibold ${currentBus.driver_name ? 'text-gray-900' : 'text-gray-400'}`}>
                            {currentBus.driver_name || 'Unassigned'}
                          </span>
                        </div>
                        {currentBus.current_latitude && currentBus.current_longitude && (
                          <div className="py-3 bg-blue-50 rounded-lg px-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-600 flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1.5" />
                                Current Location
                              </span>
                              <span className="font-mono text-xs text-blue-700">
                                {currentBus.current_latitude.toFixed(4)}, {currentBus.current_longitude.toFixed(4)}
                              </span>
                            </div>
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
