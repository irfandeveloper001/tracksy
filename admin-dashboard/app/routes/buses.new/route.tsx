import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import busService from '../../lib/api/busService';
import routeService from '../../lib/api/routeService';
import userService from '../../lib/api/userService';
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

export default function NewBusPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch routes directly from Supabase - non-blocking, fail gracefully
  const { data: routesData, isLoading: routesLoading } = useQuery({
    queryKey: ['routes', 'all', 'supabase'],
    queryFn: async () => {
      try {
        // Fetch directly from Supabase
        const routes = await routeService.getRoutesFromSupabase();
        return { routes, total: routes.length, current_page: 1, per_page: 100, last_page: 1 };
      } catch (error) {
        console.warn('⚠️ Failed to fetch routes from Supabase, form can still work without them:', error);
        return { routes: [], total: 0, current_page: 1, per_page: 100, last_page: 1 };
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Retry once
    refetchOnMount: true, // Always refetch to get latest data
  });

  // Fetch drivers directly from Supabase - non-blocking, fail gracefully
  const { data: driversData, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers', 'all', 'supabase'],
    queryFn: async () => {
      try {
        // Fetch directly from Supabase
        const drivers = await userService.getDriversFromSupabase();
        return { users: drivers, total: drivers.length, current_page: 1, per_page: 100, last_page: 1 };
      } catch (error) {
        console.warn('⚠️ Failed to fetch drivers from Supabase, form can still work without them:', error);
        return { users: [], total: 0, current_page: 1, per_page: 100, last_page: 1 };
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Retry once
    refetchOnMount: true, // Always refetch to get latest data
  });

  const routes = routesData?.routes || [];
  const drivers = driversData?.users || [];
  
  // State for typeahead/autocomplete
  const [routeSearch, setRouteSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  
  // Filter routes and drivers based on search
  const filteredRoutes = routes.filter(route =>
    route.name?.toLowerCase().includes(routeSearch.toLowerCase()) ||
    route.start_location?.toLowerCase().includes(routeSearch.toLowerCase()) ||
    route.end_location?.toLowerCase().includes(routeSearch.toLowerCase())
  );
  
  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
    driver.email?.toLowerCase().includes(driverSearch.toLowerCase()) ||
    driver.license_number?.toLowerCase().includes(driverSearch.toLowerCase())
  );
  
  // Initialize form FIRST (before using watch)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BusFormData>({
    resolver: zodResolver(busSchema),
    defaultValues: {
      bus_type: 'standard',
      capacity: 40,
      status: 'inactive',
    },
  });
  
  // Refs for click outside detection
  const routeRef = useRef<HTMLDivElement>(null);
  const driverRef = useRef<HTMLDivElement>(null);
  
  // Get watched values
  const watchedRouteId = watch('route_id');
  const watchedDriverId = watch('driver_id');
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (routeRef.current && !routeRef.current.contains(event.target as Node)) {
        setShowRouteDropdown(false);
      }
      if (driverRef.current && !driverRef.current.contains(event.target as Node)) {
        setShowDriverDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Update search when route is selected
  useEffect(() => {
    if (watchedRouteId) {
      const selectedRoute = routes.find(r => r.id === watchedRouteId);
      if (selectedRoute) {
        setRouteSearch(selectedRoute.name || '');
      }
    } else {
      setRouteSearch('');
    }
  }, [watchedRouteId, routes]);
  
  // Update search when driver is selected
  useEffect(() => {
    if (watchedDriverId) {
      const selectedDriver = drivers.find(d => d.id === watchedDriverId);
      if (selectedDriver) {
        setDriverSearch(selectedDriver.name || '');
      }
    } else {
      setDriverSearch('');
    }
  }, [watchedDriverId, drivers]);

  const createMutation = useMutation({
    mutationFn: (busData: any) => busService.createBus(busData),
    onSuccess: (data) => {
      console.log('✅ Bus created successfully:', data);
      toast.success('✅ Bus created successfully and saved to database!', {
        duration: 3000,
        icon: '🚌',
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['routes', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['drivers', 'all'] });
      setIsSubmitting(false);
      // Small delay before navigation to show success message
      setTimeout(() => {
        navigate('/buses', { replace: true });
      }, 1500);
    },
    onError: (error: any) => {
      console.error('❌ Bus creation error:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Failed to create bus. Please check your connection and try again.';
      toast.error(errorMessage, {
        duration: 5000,
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: BusFormData) => {
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!data.bus_number || !data.license_plate) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Map form data - works for both Supabase and API
      const busData: any = {
        bus_number: data.bus_number.trim(),
        license_plate: data.license_plate.trim(),
        bus_type: data.bus_type, // For API, Supabase doesn't use this
        capacity: data.capacity,
        status: data.status,
      };
      
      // Add route and driver only if they're provided
      // Supabase uses route_id and driver_id directly
      // API uses current_route_id and current_driver_id
      if (data.route_id && data.route_id !== '') {
        busData.route_id = data.route_id; // For Supabase
        busData.current_route_id = data.route_id; // For API
      }
      
      if (data.driver_id && data.driver_id !== '') {
        busData.driver_id = data.driver_id; // For Supabase
        busData.current_driver_id = data.driver_id; // For API
      }
      
      console.log('🚌 Creating bus with data:', busData);
      console.log('📝 Calling createMutation.mutate...');
      createMutation.mutate(busData);
      console.log('✅ Mutation called successfully');
    } catch (error) {
      console.error('❌ Error in onSubmit:', error);
      toast.error('Failed to create bus. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Form is ready to use immediately - dropdowns load in background
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-xl">
        <div className="relative z-10 flex items-center space-x-4">
        <button
          onClick={() => navigate('/buses')}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
            <ArrowLeftIcon className="h-6 w-6" />
        </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">Add New Bus</h1>
            <p className="text-blue-100">Fill in the bus details to add it to your fleet</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">🚌 Fleet Management</span>
            </div>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Success/Error Info - Only show if routes are loaded and empty */}
      {!routesLoading && routes.length === 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 animate-in slide-in-from-top duration-300">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Create a route first to assign it to this bus. Routes help organize your fleet and make it easier for students and drivers to find buses.
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
        {/* Form Header */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Bus Information</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to add a new bus to your fleet</p>
        </div>
        {/* Bus Number & License Plate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bus Number <span className="text-red-500">*</span>
          </label>
          <input
            {...register('bus_number')}
            type="text"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.bus_number ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="e.g., BUS-001"
          />
          {errors.bus_number && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span> {errors.bus_number.message}
              </p>
          )}
        </div>

        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              License Plate Number <span className="text-red-500">*</span>
          </label>
          <input
            {...register('license_plate')}
            type="text"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.license_plate ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
              placeholder="e.g., ABC-123 or XYZ-456"
          />
          {errors.license_plate && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span> {errors.license_plate.message}
              </p>
          )}
          </div>
        </div>

        {/* Bus Type & Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bus Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register('bus_type')}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
            >
              <option value="standard">🚌 Standard Bus</option>
              <option value="premium">⭐ Premium Bus</option>
              <option value="luxury">✨ Luxury Bus</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Select the type of bus</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seating Capacity <span className="text-red-500">*</span>
            </label>
            <input
              {...register('capacity', { valueAsNumber: true })}
              type="number"
              min="1"
              max="100"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.capacity ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="e.g., 40"
            />
            {errors.capacity && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span> {errors.capacity.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Number of seats available</p>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bus Status <span className="text-red-500">*</span>
          </label>
          <select
            {...register('status')}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
          >
            <option value="inactive">⏸️ Inactive</option>
            <option value="active">✅ Active</option>
            <option value="maintenance">🔧 Maintenance</option>
            <option value="emergency">🚨 Emergency</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">Set the initial status of the bus</p>
        </div>

        {/* Route & Driver (Optional) - Typeahead/Autocomplete */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Route Typeahead */}
          <div className="relative" ref={routeRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assigned Route <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            {routesLoading ? (
              <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center">
                <svg className="animate-spin h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-gray-500">Loading routes...</span>
              </div>
            ) : routes.length === 0 ? (
              <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-500">No routes available</p>
                <p className="mt-2 text-xs text-blue-600">
                  💡 Create a route first to assign it to this bus
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={routeSearch}
                    onChange={(e) => {
                      setRouteSearch(e.target.value);
                      setShowRouteDropdown(true);
                    }}
                    onFocus={() => setShowRouteDropdown(true)}
                    placeholder="Search routes..."
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <ChevronDownIcon 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => setShowRouteDropdown(!showRouteDropdown)}
                  />
                </div>
                {showRouteDropdown && filteredRoutes.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    <div
                      className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setValue('route_id', '');
                        setRouteSearch('');
                        setShowRouteDropdown(false);
                      }}
                    >
                      🚫 No Route Assigned
                    </div>
                    {filteredRoutes.map((route) => (
                      <div
                        key={route.id}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setValue('route_id', route.id);
                          setRouteSearch(route.name || '');
                          setShowRouteDropdown(false);
                        }}
                      >
                        <div className="font-medium text-gray-900">🗺️ {route.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {route.start_location} → {route.end_location}
                          {route.status === 'active' && <span className="ml-2 text-green-600">✓ Active</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <input type="hidden" {...register('route_id')} />
                {watch('route_id') && (
                  <div className="mt-2 text-sm text-blue-600">
                    Selected: {routes.find(r => r.id === watch('route_id'))?.name}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Driver Typeahead */}
          <div className="relative" ref={driverRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assigned Driver <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            {driversLoading ? (
              <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center">
                <svg className="animate-spin h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-gray-500">Loading drivers...</span>
              </div>
            ) : drivers.length === 0 ? (
              <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-500">No drivers available</p>
                <p className="mt-2 text-xs text-blue-600">
                  💡 No active drivers available. Drivers can be assigned later.
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={driverSearch}
                    onChange={(e) => {
                      setDriverSearch(e.target.value);
                      setShowDriverDropdown(true);
                    }}
                    onFocus={() => setShowDriverDropdown(true)}
                    placeholder="Search drivers..."
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <ChevronDownIcon 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => setShowDriverDropdown(!showDriverDropdown)}
                  />
                </div>
                {showDriverDropdown && filteredDrivers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    <div
                      className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setValue('driver_id', '');
                        setDriverSearch('');
                        setShowDriverDropdown(false);
                      }}
                    >
                      🚫 No Driver Assigned
                    </div>
                    {filteredDrivers.map((driver) => (
                      <div
                        key={driver.id}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setValue('driver_id', driver.id);
                          setDriverSearch(driver.name || '');
                          setShowDriverDropdown(false);
                        }}
                      >
                        <div className="font-medium text-gray-900">👤 {driver.name || 'Unknown Driver'}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {driver.license_number && `License: ${driver.license_number}`}
                          {driver.email && ` • ${driver.email}`}
                          {driver.status === 'active' && <span className="ml-2 text-green-600">✓ Active</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <input type="hidden" {...register('driver_id')} />
                {watch('driver_id') && (
                  <div className="mt-2 text-sm text-blue-600">
                    Selected: {drivers.find(d => d.id === watch('driver_id'))?.name}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The bus will be saved to the database and will be immediately available in the driver and student apps.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/buses')}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 active:scale-95"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving to Database...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Bus to Database
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
