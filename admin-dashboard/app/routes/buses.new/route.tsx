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
  route_id: z.preprocess(
    (val) => {
      // Handle null, undefined, empty string
      if (val === null || val === undefined || val === '' || val === 'null') {
        return undefined;
      }
      // Convert number to string, keep string as is
      return typeof val === 'number' ? String(val) : val;
    },
    z.string().optional()
  ),
  driver_id: z.preprocess(
    (val) => {
      // Handle null, undefined, empty string
      if (val === null || val === undefined || val === '' || val === 'null') {
        return undefined;
      }
      // Convert number to string, keep string as is
      return typeof val === 'number' ? String(val) : val;
    },
    z.string().optional()
  ),
});

type BusFormData = z.infer<typeof busSchema>;

export default function NewBusPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch routes from Laravel backend API - non-blocking, fail gracefully
  const { data: routesData, isLoading: routesLoading, isError: routesError } = useQuery({
    queryKey: ['routes', 'all', 'backend'],
    queryFn: async () => {
      try {
        // Fetch from Laravel backend API
        const response = await routeService.getRoutes(1, 100); // Get first 100 routes
        return response;
      } catch (error) {
        console.warn('⚠️ Failed to fetch routes from backend, form can still work without them:', error);
        return { routes: [], total: 0, current_page: 1, per_page: 100, last_page: 1 };
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Retry once
    refetchOnMount: true, // Always refetch to get latest data
  });

  // Fetch drivers from Laravel backend API - non-blocking, fail gracefully
  const { data: driversData, isLoading: driversLoading, isError: driversError } = useQuery({
    queryKey: ['drivers', 'all', 'backend'],
    queryFn: async () => {
      try {
        // Fetch from Laravel backend API
        const response = await userService.getDrivers(1, 100); // Get first 100 drivers
        return response;
      } catch (error) {
        console.warn('⚠️ Failed to fetch drivers from backend, form can still work without them:', error);
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
    formState: { errors, isSubmitting: formIsSubmitting },
    watch,
    setValue,
  } = useForm<BusFormData>({
    resolver: zodResolver(busSchema),
    defaultValues: {
      bus_type: 'standard',
      capacity: 40,
            status: 'active', // Default to active so student/driver apps can see it
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
    mutationFn: async (busData: any) => {
      console.log('🚀 Mutation function called with data:', busData);
      const result = await busService.createBus(busData);
      console.log('✅ Mutation function completed:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('✅ Bus created successfully:', data);
      
      // Build success message with assignment details
      let successMessage = 'Bus created and saved to database successfully!';
      const assignments = [];
      
      if (data.currentRoute) {
        assignments.push(`Route: ${data.currentRoute.name}`);
      }
      if (data.currentDriver) {
        assignments.push(`Driver: ${data.currentDriver.name}`);
      }
      
      if (assignments.length > 0) {
        successMessage += `\nAssignments: ${assignments.join(', ')}`;
      }
      
      toast.success(successMessage, {
        duration: 4000,
        icon: '🚌',
        style: {
          background: '#10b981',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
          whiteSpace: 'pre-line',
        },
      });
      
      // Invalidate all bus-related queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['routes', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['drivers', 'all'] });
      setIsSubmitting(false);
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/buses', { replace: true });
      }, 2000);
    },
    onError: (error: any) => {
      console.error('❌ Bus creation error:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to create bus';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle validation errors
        if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages[0] : messages;
              return `${field}: ${msg}`;
            })
            .join(', ');
          errorMessage = validationErrors;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
        },
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: BusFormData) => {
    // Prevent double submission
    if (isSubmitting) {
      console.warn('⚠️ Form submission already in progress, ignoring duplicate submit');
      return;
    }

    setIsSubmitting(true);
    console.log('🚀 Form submission started');
    // Safely log form data (avoid circular references)
    console.log('📋 Raw form data from react-hook-form:', {
      bus_number: data.bus_number,
      license_plate: data.license_plate,
      bus_type: data.bus_type,
      capacity: data.capacity,
      status: data.status,
      route_id: data.route_id,
      driver_id: data.driver_id,
    });
    console.log('📋 Available routes:', routes.length);
    console.log('📋 Available drivers:', drivers.length);
    
    try {
      // Validate required fields
      if (!data.bus_number || !data.license_plate) {
        toast.error('Please fill in all required fields (Bus Number and License Plate)', {
          duration: 4000,
        });
        setIsSubmitting(false);
        return;
      }

      // Get actual values - prefer form data, fallback to watch values
      // Handle empty strings, null, undefined, and 'null' string
      const getValidId = (formValue: string | undefined | null, watchValue: string | undefined | null) => {
        const value = formValue || watchValue;
        if (!value || value === '' || value === 'null' || value === null || value === undefined) {
          return undefined;
        }
        return String(value);
      };
      
      const actualRouteId = getValidId(data.route_id, watch('route_id'));
      const actualDriverId = getValidId(data.driver_id, watch('driver_id'));
      
      console.log('🔍 Route ID from form:', data.route_id);
      console.log('🔍 Route ID from watch:', watch('route_id'));
      console.log('🔍 Driver ID from form:', data.driver_id);
      console.log('🔍 Driver ID from watch:', watch('driver_id'));
      console.log('🔍 Final route ID to use:', actualRouteId);
      console.log('🔍 Final driver ID to use:', actualDriverId);

      // Validate that if route/driver are selected, they are valid
      let validationErrors: string[] = [];
      
      // Validate route if selected - use string comparison for ID matching
      if (actualRouteId) {
        // Convert both to string for comparison to handle number/string mismatches
        const routeIdStr = String(actualRouteId);
        const selectedRoute = routes.find(r => String(r.id) === routeIdStr);
        console.log('🔍 Looking for route with ID:', actualRouteId, '(type:', typeof actualRouteId, ')');
        console.log('🔍 Available route IDs:', routes.map(r => ({ id: r.id, idStr: String(r.id), type: typeof r.id, name: r.name })));
        console.log('🔍 Found route:', selectedRoute);
        if (!selectedRoute) {
          console.error('❌ Route not found in routes array');
          validationErrors.push('Selected route is invalid or no longer available');
        } else {
          console.log('✅ Route validation passed:', selectedRoute.name);
        }
      }

      // Validate driver if selected - use string comparison for ID matching
      if (actualDriverId) {
        // Convert both to string for comparison to handle number/string mismatches
        const driverIdStr = String(actualDriverId);
        const selectedDriver = drivers.find(d => String(d.id) === driverIdStr);
        console.log('🔍 Looking for driver with ID:', actualDriverId, '(type:', typeof actualDriverId, ')');
        console.log('🔍 Available driver IDs:', drivers.map(d => ({ id: d.id, idStr: String(d.id), type: typeof d.id, name: d.name })));
        console.log('🔍 Found driver:', selectedDriver);
        if (!selectedDriver) {
          console.error('❌ Driver not found in drivers array');
          validationErrors.push('Selected driver is invalid or no longer available');
        } else {
          // getDrivers() already filters for drivers only, so no role check needed
          // But log if there's a role field for debugging
          if ('role' in selectedDriver) {
            console.log('🔍 Driver role:', (selectedDriver as any).role);
          }
          console.log('✅ Driver validation passed:', selectedDriver.name);
        }
      }

      // Show validation errors if any
      if (validationErrors.length > 0) {
        console.error('❌ Validation errors:', validationErrors);
        toast.error(validationErrors.join('. '), {
          duration: 5000,
          style: {
            background: '#ef4444',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
          },
        });
        setIsSubmitting(false);
        return;
      }

      // Map form data for Laravel API
      const busData: any = {
        bus_number: data.bus_number.trim(),
        license_plate: data.license_plate.trim(),
        bus_type: data.bus_type,
        capacity: Number(data.capacity),
        status: data.status || 'active',
      };
      
      // Add route and driver only if they're provided and valid
      // Use string comparison to handle number/string ID mismatches
      if (actualRouteId) {
        const routeExists = routes.some(r => String(r.id) === String(actualRouteId));
        console.log('✅ Route exists check:', routeExists, 'for ID:', actualRouteId);
        if (routeExists) {
          busData.current_route_id = actualRouteId;
        } else {
          console.error('❌ Route validation failed');
          toast.error('Selected route is invalid. Please select a valid route.', {
            duration: 5000,
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      if (actualDriverId) {
        // Since getDrivers() already filters for role='driver', we just check existence
        const driverExists = drivers.some(d => String(d.id) === String(actualDriverId));
        console.log('✅ Driver exists check:', driverExists, 'for ID:', actualDriverId);
        if (driverExists) {
          busData.current_driver_id = actualDriverId;
        } else {
          console.error('❌ Driver validation failed');
          toast.error('Selected driver is invalid. Please select a valid driver.', {
            duration: 5000,
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      console.log('🚌 Final bus data to send:', busData);
      console.log('📝 Route assigned:', busData.current_route_id ? `Yes (${busData.current_route_id})` : 'No');
      console.log('📝 Driver assigned:', busData.current_driver_id ? `Yes (${busData.current_driver_id})` : 'No');
      console.log('📝 Calling createMutation.mutateAsync...');
      
      // Use mutateAsync to properly handle promises and errors
      try {
        const result = await createMutation.mutateAsync(busData);
        console.log('✅ Bus created successfully:', result);
        console.log('✅ Created bus ID:', result.id);
        
        // Show success message with assignment details
        const assignmentDetails = [];
        if (busData.current_route_id) {
          const routeName = routes.find(r => r.id === busData.current_route_id)?.name || 'route';
          assignmentDetails.push(`Route: ${routeName}`);
        }
        if (busData.current_driver_id) {
          const driverName = drivers.find(d => d.id === busData.current_driver_id)?.name || 'driver';
          assignmentDetails.push(`Driver: ${driverName}`);
        }
        
        if (assignmentDetails.length > 0) {
          console.log('✅ Assignments confirmed:', assignmentDetails.join(', '));
        }
      } catch (mutationError: any) {
        console.error('❌ Mutation error caught:', mutationError);
        console.error('❌ Mutation error details:', {
          message: mutationError?.message,
          response: mutationError?.response?.data,
          status: mutationError?.response?.status,
        });
        // Error is already handled in mutation onError, but ensure submitting state is reset
        setIsSubmitting(false);
        throw mutationError; // Re-throw to let mutation error handler deal with it
      }
    } catch (error: any) {
      console.error('❌ Error in onSubmit:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      // Fallback error handling
      if (!error.response) {
        toast.error('Failed to create bus. Please check your connection and try again.', {
          duration: 5000,
        });
      }
      setIsSubmitting(false);
    }
  };

  // Form is ready to use immediately - dropdowns load in background
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Enhanced Header with gradient and animations */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl transform transition-all hover:scale-[1.01]">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="relative z-10 flex items-center space-x-6">
        <button
          onClick={() => navigate('/buses')}
            className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm"
        >
            <ArrowLeftIcon className="h-6 w-6" />
        </button>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-lg">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Add New Bus
                </h1>
                <p className="text-blue-100 text-lg font-medium">Fill in the bus details to add it to your fleet</p>
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-400/20 rounded-full -ml-36 -mb-36 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      </div>

      {/* Success/Error Info - Only show if routes are loaded and empty */}
      {!routesLoading && !routesError && routes.length === 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 animate-in slide-in-from-top duration-300">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Create a route first to assign it to this bus. Routes help organize your fleet and make it easier for students and drivers to find buses.
          </p>
        </div>
      )}

      {/* Enhanced Form */}
      <form 
        onSubmit={handleSubmit(
          async (data) => {
            console.log('📝 Form validation passed, calling onSubmit');
            console.log('📝 Form data received:', data);
            await onSubmit(data);
          },
          (errors) => {
            // Safely log errors without circular references
            const safeErrors = Object.entries(errors).map(([field, error]: [string, any]) => ({
              field,
              message: error?.message || 'Invalid',
              type: error?.type || 'unknown'
            }));
            console.error('❌ Form validation errors:', safeErrors);
            const errorMessages = safeErrors
              .map(err => `${err.field}: ${err.message}`)
              .join(', ');
            toast.error(`Form validation failed: ${errorMessages}`, {
              duration: 5000,
            });
          }
        )}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all hover:shadow-3xl"
      >
        {/* Form Header with gradient */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bus Information</h2>
              <p className="text-sm text-gray-600 mt-1">Fill in the details to add a new bus to your fleet</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
        {/* Bus Number & License Plate - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-700 rounded-lg px-2 py-1 mr-2 text-xs font-semibold">REQUIRED</span>
              Bus Number <span className="text-red-500 ml-1">*</span>
          </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
          <input
            {...register('bus_number')}
            type="text"
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium ${
                  errors.bus_number ? 'border-red-500 bg-red-50 animate-pulse' : 'border-gray-300 hover:border-blue-400 focus:shadow-lg'
            }`}
            placeholder="e.g., BUS-001"
          />
            </div>
          {errors.bus_number && (
              <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.bus_number.message}
              </p>
          )}
        </div>

          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-700 rounded-lg px-2 py-1 mr-2 text-xs font-semibold">REQUIRED</span>
              License Plate <span className="text-red-500 ml-1">*</span>
          </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
          <input
            {...register('license_plate')}
            type="text"
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium tracking-wider ${
                  errors.license_plate ? 'border-red-500 bg-red-50 animate-pulse' : 'border-gray-300 hover:border-blue-400 focus:shadow-lg'
            }`}
                placeholder="e.g., ABC-123"
          />
            </div>
          {errors.license_plate && (
              <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.license_plate.message}
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
              className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400 font-medium bg-white cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
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
              className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium ${
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
            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400 font-medium bg-white cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem',
            }}
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
            {routesLoading && !routesError ? (
              <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center">
                <svg className="animate-spin h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-gray-500">Loading routes...</span>
              </div>
            ) : routes.length === 0 || routesError ? (
              <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-500">No routes available {routesError ? '(optional)' : ''}</p>
                <p className="mt-2 text-xs text-blue-600">
                  💡 {routesError ? 'Routes unavailable. You can still create the bus without assigning a route.' : 'Create a route first to assign it to this bus'}
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
                    className="w-full pl-10 pr-10 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400 font-medium"
                  />
                  <ChevronDownIcon 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => setShowRouteDropdown(!showRouteDropdown)}
                  />
                </div>
                {showRouteDropdown && filteredRoutes.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-72 overflow-auto backdrop-blur-lg">
                    <div
                      className="px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 cursor-pointer transition-all duration-200 border-b border-gray-100"
                      onClick={() => {
                        setValue('route_id', '');
                        setRouteSearch('');
                        setShowRouteDropdown(false);
                      }}
                    >
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear Selection
                      </span>
                    </div>
                    {filteredRoutes.map((route) => (
                      <div
                        key={route.id}
                        className="px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-all duration-200 group"
                        onClick={() => {
                          setValue('route_id', route.id, { shouldValidate: true, shouldDirty: true });
                          setRouteSearch(route.name || '');
                          setShowRouteDropdown(false);
                          console.log('✅ Route selected:', route.id, route.name);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{route.name}</div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                                <span>{route.start_location} → {route.end_location}</span>
                                {route.status === 'active' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Active
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <input 
                  type="hidden" 
                  {...register('route_id')} 
                  value={watch('route_id') || ''}
                />
                {watch('route_id') && routes.find(r => r.id === watch('route_id')) && (
                  <div className="mt-3 flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Selected Route</span>
                      <p className="text-sm font-bold text-gray-900">{routes.find(r => r.id === watch('route_id'))?.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setValue('route_id', '');
                        setRouteSearch('');
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
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
            {driversLoading && !driversError ? (
              <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center">
                <svg className="animate-spin h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-gray-500">Loading drivers...</span>
              </div>
            ) : drivers.length === 0 || driversError ? (
              <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-500">No drivers available {driversError ? '(optional)' : ''}</p>
                <p className="mt-2 text-xs text-blue-600">
                  💡 {driversError ? 'Drivers unavailable. You can still create the bus without assigning a driver.' : 'No active drivers available. Drivers can be assigned later.'}
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
                    className="w-full pl-10 pr-10 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400 font-medium"
                  />
                  <ChevronDownIcon 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => setShowDriverDropdown(!showDriverDropdown)}
                  />
                </div>
                {showDriverDropdown && filteredDrivers.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-72 overflow-auto backdrop-blur-lg">
                    <div
                      className="px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 cursor-pointer transition-all duration-200 border-b border-gray-100"
                      onClick={() => {
                        setValue('driver_id', '');
                        setDriverSearch('');
                        setShowDriverDropdown(false);
                      }}
                    >
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear Selection
                      </span>
                    </div>
                    {filteredDrivers.map((driver) => (
                      <div
                        key={driver.id}
                        className="px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-all duration-200 group"
                        onClick={() => {
                          setValue('driver_id', driver.id, { shouldValidate: true, shouldDirty: true });
                          setDriverSearch(driver.name || '');
                          setShowDriverDropdown(false);
                          console.log('✅ Driver selected:', driver.id, driver.name);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{driver.name || 'Unknown Driver'}</div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2 flex-wrap">
                                {driver.license_number && (
                                  <span className="inline-flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {driver.license_number}
                                  </span>
                                )}
                                {driver.email && (
                                  <span className="inline-flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {driver.email}
                                  </span>
                                )}
                                {driver.status === 'active' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Active
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <input 
                  type="hidden" 
                  {...register('driver_id')} 
                  value={watch('driver_id') || ''}
                />
                {watch('driver_id') && drivers.find(d => d.id === watch('driver_id')) && (
                  <div className="mt-3 flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Selected Driver</span>
                      <p className="text-sm font-bold text-gray-900">{drivers.find(d => d.id === watch('driver_id'))?.name || 'Unknown Driver'}</p>
                      {drivers.find(d => d.id === watch('driver_id'))?.license_number && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          License: {drivers.find(d => d.id === watch('driver_id'))?.license_number}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setValue('driver_id', '');
                        setDriverSearch('');
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


        {/* Enhanced Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-transparent -mx-8 px-8 pb-8">
          <button
            type="button"
            onClick={() => navigate('/buses')}
            className="px-8 py-4 border-2 border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-lg hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl font-bold text-lg transform hover:scale-105 active:scale-95 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            {isSubmitting ? (
              <span className="flex items-center relative z-10">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="animate-pulse">Saving to Database...</span>
              </span>
            ) : (
              <span className="flex items-center relative z-10">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Bus to Database
              </span>
            )}
          </button>
        </div>
        </div>
      </form>
    </div>
  );
}
