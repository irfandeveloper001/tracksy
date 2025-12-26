import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, PlusIcon, XMarkIcon, MapPinIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import routeService from '../../lib/api/routeService';
import stopService from '../../lib/api/stopService';
import locationService from '../../lib/api/locationService';
import { geocodeAddress, calculateRouteDistanceAndTime, formatDistance, formatDuration } from '../../lib/utils/geocoding';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../lib/store/authStore';

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

interface StopInput {
  id: string;
  name: string;
  address: string;
  distance?: number; // in meters (to next stop or destination)
  duration?: number; // in seconds (to next stop or destination)
  isCalculating?: boolean;
}

export default function NewRoutePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication before allowing route creation
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      const token = localStorage.getItem('laravel_token') || localStorage.getItem('tracksy_admin:auth_token');
      if (!token) {
        toast.error('Please log in to create routes', {
          duration: 3000,
          icon: '🔒',
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    }
  }, [isAuthenticated, navigate]);
  const [stops, setStops] = useState<StopInput[]>([]);
  const [totalDistance, setTotalDistance] = useState<number | null>(null);
  const [totalDuration, setTotalDuration] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [autoFilledDistance, setAutoFilledDistance] = useState(false);
  const [autoFilledDuration, setAutoFilledDuration] = useState(false);

  // Location selection state for Source
  const [sourceCountryId, setSourceCountryId] = useState<number | null>(null);
  const [sourceStateId, setSourceStateId] = useState<number | null>(null);
  const [sourceCityId, setSourceCityId] = useState<number | null>(null);
  
  // Location selection state for Destination
  const [destCountryId, setDestCountryId] = useState<number | null>(null);
  const [destStateId, setDestStateId] = useState<number | null>(null);
  const [destCityId, setDestCityId] = useState<number | null>(null);
  const [destUniversityId, setDestUniversityId] = useState<string | null>(null);

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: () => locationService.getCountries(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Fetch states for source country
  const { data: sourceStates = [] } = useQuery({
    queryKey: ['states', sourceCountryId],
    queryFn: () => locationService.getStates(sourceCountryId!),
    enabled: !!sourceCountryId,
  });

  // Fetch cities for source state
  const { data: sourceCities = [] } = useQuery({
    queryKey: ['cities', sourceStateId],
    queryFn: () => locationService.getCities(sourceStateId!),
    enabled: !!sourceStateId,
  });

  // Fetch states for destination country
  const { data: destStates = [] } = useQuery({
    queryKey: ['states', destCountryId, 'dest'],
    queryFn: () => locationService.getStates(destCountryId!),
    enabled: !!destCountryId,
  });

  // Fetch cities for destination state
  const { data: destCities = [] } = useQuery({
    queryKey: ['cities', destStateId, 'dest'],
    queryFn: () => locationService.getCities(destStateId!),
    enabled: !!destStateId,
  });

  // Get selected country and state names for university filtering
  const selectedDestCountry = countries.find(c => c.id === destCountryId);
  const selectedDestState = destStates.find(s => s.id === destStateId);
  const selectedDestCity = destCities.find(c => c.id === destCityId);

  // Fetch universities for destination (filtered by country + state, not city)
  const { data: universities = [], isLoading: universitiesLoading } = useQuery({
    queryKey: ['universities', selectedDestCountry?.name, selectedDestState?.name, selectedDestCity?.name],
    queryFn: () => {
      if (!selectedDestCountry?.name || !selectedDestState?.name) {
        return Promise.resolve([]);
      }
      return locationService.getUniversitiesByCountryAndState(
        selectedDestCountry.name,
        selectedDestState.name
      );
    },
    enabled: !!selectedDestCountry && !!selectedDestState && !!selectedDestCity,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      status: 'active',
    },
  });

  const startLocation = watch('start_location');
  const endLocation = watch('end_location');

  // Handle location selection changes
  const handleSourceCountryChange = (countryId: string) => {
    const id = countryId ? parseInt(countryId) : null;
    setSourceCountryId(id);
    setSourceStateId(null);
    setSourceCityId(null);
  };

  const handleSourceStateChange = (stateId: string) => {
    const id = stateId ? parseInt(stateId) : null;
    setSourceStateId(id);
    setSourceCityId(null);
  };

  const handleSourceCityChange = (cityId: string) => {
    const id = cityId ? parseInt(cityId) : null;
    setSourceCityId(id);
    const city = sourceCities.find(c => c.id === id);
    if (city) {
      const location = `${city.name}, ${sourceStates.find(s => s.id === sourceStateId)?.name || ''}, ${countries.find(c => c.id === sourceCountryId)?.name || ''}`;
      setValue('start_location', location);
    }
  };

  const handleDestCountryChange = (countryId: string) => {
    const id = countryId ? parseInt(countryId) : null;
    setDestCountryId(id);
    setDestStateId(null);
    setDestCityId(null);
    setDestUniversityId(null);
  };

  const handleDestStateChange = (stateId: string) => {
    const id = stateId ? parseInt(stateId) : null;
    setDestStateId(id);
    setDestCityId(null);
    setDestUniversityId(null);
  };

  const handleDestCityChange = (cityId: string) => {
    const id = cityId ? parseInt(cityId) : null;
    setDestCityId(id);
    setDestUniversityId(null);
  };

  const handleUniversityChange = (universityName: string) => {
    setDestUniversityId(universityName ? universityName : null);
    const university = universities.find(u => u.name === universityName || u.value === universityName);
    if (university) {
      const location = `${university.name}, ${selectedDestCity?.name || ''}, ${selectedDestState?.name || ''}, ${selectedDestCountry?.name || ''}`;
      setValue('end_location', location);
    }
  };

  // Calculate distances and times when locations or stops change
  useEffect(() => {
    const calculateRouteMetrics = async () => {
      if (!startLocation || !endLocation || isCalculating) return;

      // If no stops, calculate direct route from start to end
      if (stops.length === 0) {
        setIsCalculating(true);
        try {
          const result = await calculateRouteDistanceAndTime(startLocation, endLocation);
          if (result) {
            setTotalDistance(result.distance);
            setTotalDuration(result.duration);
            if (!autoFilledDistance) {
              setValue('distance', parseFloat((result.distance / 1000).toFixed(2)));
              setAutoFilledDistance(true);
            }
            if (!autoFilledDuration) {
              setValue('estimated_duration', Math.round(result.duration / 60));
              setAutoFilledDuration(true);
            }
          }
        } catch (error) {
          console.error('Error calculating route:', error);
        } finally {
          setIsCalculating(false);
        }
      } else {
        // Calculate distances between stops
        setIsCalculating(true);
        try {
          let totalDist = 0;
          let totalDur = 0;
          // Initialize all stops with isCalculating: true for visual feedback
          const updatedStops = stops.map(s => ({ ...s, isCalculating: true }));
          setStops(updatedStops); // Show loading state immediately

          // Calculate distances: each stop shows distance/time TO the next point
          // First, calculate from start to first stop (for total calculation)
          if (stops.length > 0 && stops[0].address && startLocation) {
            const startToFirst = await calculateRouteDistanceAndTime(startLocation, stops[0].address);
            if (startToFirst) {
              totalDist += startToFirst.distance;
              totalDur += startToFirst.duration;
            }
          }
          
          // First stop: calculate to second stop (if exists) or to destination
          if (stops.length > 0 && stops[0].address) {
            if (stops.length > 1 && stops[1].address) {
              const result = await calculateRouteDistanceAndTime(stops[0].address, stops[1].address);
              if (result) {
                updatedStops[0].distance = result.distance;
                updatedStops[0].duration = result.duration;
                updatedStops[0].isCalculating = false; // Stop loading once calculated
                totalDist += result.distance;
                totalDur += result.duration;
              }
            } else if (endLocation) {
              // Only one stop, calculate to destination
              const result = await calculateRouteDistanceAndTime(stops[0].address, endLocation);
              if (result) {
                updatedStops[0].distance = result.distance;
                updatedStops[0].duration = result.duration;
                updatedStops[0].isCalculating = false; // Stop loading once calculated
                totalDist += result.distance;
                totalDur += result.duration;
              }
            }
          }

          // Between stops: each stop shows distance to next stop
          for (let i = 1; i < stops.length - 1; i++) {
            if (stops[i].address && stops[i + 1].address) {
              const result = await calculateRouteDistanceAndTime(stops[i].address, stops[i + 1].address);
              if (result) {
                updatedStops[i].distance = result.distance;
                updatedStops[i].duration = result.duration;
                updatedStops[i].isCalculating = false; // Stop loading once calculated
                totalDist += result.distance;
                totalDur += result.duration;
              }
            }
          }

          // Last stop: calculate to destination
          if (stops.length > 0 && stops[stops.length - 1].address && endLocation) {
            const lastIndex = stops.length - 1;
            const lastResult = await calculateRouteDistanceAndTime(stops[lastIndex].address, endLocation);
            if (lastResult) {
              updatedStops[lastIndex].distance = lastResult.distance;
              updatedStops[lastIndex].duration = lastResult.duration;
              updatedStops[lastIndex].isCalculating = false; // Stop loading once calculated
              totalDist += lastResult.distance;
              totalDur += lastResult.duration;
            }
          }

          // Ensure all stops that couldn't be calculated are marked as not calculating
          updatedStops.forEach(stop => {
            if (stop.isCalculating) {
              stop.isCalculating = false;
            }
          });

          // Update all stops once at the end with final calculated values
          setStops([...updatedStops]);
          setTotalDistance(totalDist);
          setTotalDuration(totalDur);
          if (!autoFilledDistance) {
            setValue('distance', parseFloat((totalDist / 1000).toFixed(2)));
            setAutoFilledDistance(true);
          }
          if (!autoFilledDuration) {
            setValue('estimated_duration', Math.round(totalDur / 60));
            setAutoFilledDuration(true);
          }
        } catch (error) {
          console.error('Error calculating route with stops:', error);
          // Clear loading state on error
          setStops(stops.map(s => ({ ...s, isCalculating: false })));
        } finally {
          setIsCalculating(false);
        }
      }
    };

    // Debounce calculation
    const timeoutId = setTimeout(() => {
      calculateRouteMetrics();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [startLocation, endLocation, stops.map(s => s.address).join(',')]); // Removed isCalculating from deps

  const createMutation = useMutation({
    mutationFn: async (routeData: any) => {
      console.log('🚀 Creating route with data:', routeData);
      const result = await routeService.createRoute(routeData);
      console.log('✅ Route created:', result);
      return result;
    },
    onSuccess: (data) => {
      toast.success('Route created successfully and saved to database!', {
        duration: 3000,
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setIsSubmitting(false);
      
      // Navigate to dashboard page after successful creation
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    },
    onError: (error: any) => {
      console.error('❌ Route creation error:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Failed to create route. Please check your connection and try again.';
      toast.error(errorMessage, {
        duration: 5000,
      });
      setIsSubmitting(false);
    },
  });

  const addStop = () => {
    const newStop: StopInput = {
      id: `stop-${Date.now()}`,
      name: '',
      address: '',
    };
    setStops([...stops, newStop]);
    setAutoFilledDistance(false);
    setAutoFilledDuration(false);
  };

  const removeStop = (stopId: string) => {
    setStops(stops.filter(stop => stop.id !== stopId));
    setAutoFilledDistance(false);
    setAutoFilledDuration(false);
  };

  const updateStop = (stopId: string, field: 'name' | 'address', value: string) => {
    setStops(stops.map(stop => 
      stop.id === stopId ? { ...stop, [field]: value, distance: undefined, duration: undefined } : stop
    ));
    setAutoFilledDistance(false);
    setAutoFilledDuration(false);
  };

  const onSubmit = async (data: RouteFormData) => {
    // Check authentication before submitting
    const token = localStorage.getItem('laravel_token') || localStorage.getItem('tracksy_admin:auth_token');
    if (!token || !isAuthenticated) {
      toast.error('Please log in to create routes', {
        duration: 3000,
        icon: '🔒',
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    setIsSubmitting(true);
    try {
      let routeDistance = data.distance;
      let routeDuration = data.estimated_duration;

      // Use calculated values as default if not provided
      if (totalDistance && !routeDistance) {
        routeDistance = parseFloat((totalDistance / 1000).toFixed(2));
      }
      if (totalDuration && !routeDuration) {
        routeDuration = Math.round(totalDuration / 60);
      }

      // Map form data to Laravel API format
      const routeData: any = {
        name: data.name.trim(),
        start_location: data.start_location.trim(),
        end_location: data.end_location.trim(),
        start_point: data.start_location.trim(),
        end_point: data.end_location.trim(),
        status: data.status,
        distance: routeDistance,
        estimated_duration: routeDuration,
      };

      // Create stops if they exist
      if (stops.length > 0) {
        const createdStops = [];
        const stopErrors: string[] = [];
        
        for (let i = 0; i < stops.length; i++) {
          const stop = stops[i];
          if (stop.name && stop.address) {
            try {
              const coords = await geocodeAddress(stop.address);
              if (coords) {
                const newStop = await stopService.createStop({
                  name: stop.name,
                  address: stop.address,
                  latitude: coords.lat,
                  longitude: coords.lng,
                });
                createdStops.push({
                  stop_id: newStop.id,
                  order: i + 1, // Use index instead of indexOf for accurate ordering
                  estimated_time: stop.duration ? Math.round(stop.duration / 60) : null,
                });
              }
            } catch (error: any) {
              console.error(`Failed to create stop ${stop.name}:`, error);
              const errorMsg = error.response?.data?.message || error.message || `Failed to create stop: ${stop.name}`;
              stopErrors.push(errorMsg);
              // Continue with other stops even if one fails
            }
          }
        }

        // Show accumulated errors if any
        if (stopErrors.length > 0) {
          toast.error(`Some stops failed to create: ${stopErrors.join('; ')}`, {
            duration: 5000,
          });
        }

        // Only add stops if we successfully created at least one
        if (createdStops.length > 0) {
          routeData.stops = createdStops;
        } else if (stops.length > 0) {
          // If we had stops but none were created, still create route but warn user
          toast.warning('Route will be created without stops due to errors', {
            duration: 4000,
          });
        }
      }

      console.log('🛣️ Creating route with data:', routeData);
      await createMutation.mutateAsync(routeData);
    } catch (error) {
      console.error('❌ Error in onSubmit:', error);
      // Error is already handled in mutation onError
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Enhanced Header with gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl transform transition-all hover:scale-[1.01]">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="relative z-10 flex items-center space-x-6">
          <button
            onClick={() => navigate('/routes')}
            className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-lg">
                <MapPinIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Create New Route
                </h1>
                <p className="text-blue-100 text-lg font-medium">Define a new bus route for your fleet</p>
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-400/20 rounded-full -ml-36 -mb-36 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      </div>

      {/* Enhanced Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all hover:shadow-3xl">
        {/* Form Header with gradient */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Route Information</h2>
              <p className="text-sm text-gray-600 mt-1">Fill in the details to create a new route</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Route Name */}
          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-700 rounded-lg px-2 py-1 mr-2 text-xs font-semibold">REQUIRED</span>
              Route Name <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <input
                {...register('name')}
                type="text"
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium ${
                  errors.name ? 'border-red-500 bg-red-50 animate-pulse' : 'border-gray-300 hover:border-blue-400 focus:shadow-lg'
                }`}
                placeholder="e.g., Downtown to University"
              />
            </div>
            {errors.name && (
              <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Source Location - Cascading Dropdowns */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2 text-blue-600" />
              Source Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={sourceCountryId || ''}
                  onChange={(e) => handleSourceCountryChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium bg-white cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State/Province {sourceCountryId && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={sourceStateId || ''}
                  onChange={(e) => handleSourceStateChange(e.target.value)}
                  disabled={!sourceCountryId}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium bg-white cursor-pointer appearance-none ${
                    !sourceCountryId ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="">Select State</option>
                  {sourceStates.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City {sourceStateId && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={sourceCityId || ''}
                  onChange={(e) => handleSourceCityChange(e.target.value)}
                  disabled={!sourceStateId}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium bg-white cursor-pointer appearance-none ${
                    !sourceStateId ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="">Select City</option>
                  {sourceCities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <input type="hidden" {...register('start_location')} />
            {errors.start_location && (
              <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.start_location.message}
              </p>
            )}
          </div>

          {/* Destination Location - Cascading Dropdowns */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Destination Location (University)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={destCountryId || ''}
                  onChange={(e) => handleDestCountryChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium bg-white cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State/Province {destCountryId && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={destStateId || ''}
                  onChange={(e) => handleDestStateChange(e.target.value)}
                  disabled={!destCountryId}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium bg-white cursor-pointer appearance-none ${
                    !destCountryId ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="">Select State</option>
                  {destStates.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City {destStateId && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={destCityId || ''}
                  onChange={(e) => handleDestCityChange(e.target.value)}
                  disabled={!destStateId}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium bg-white cursor-pointer appearance-none ${
                    !destStateId ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="">Select City</option>
                  {destCities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  University {destCityId && selectedDestState && <span className="text-red-500">*</span>}
                </label>
                {selectedDestCity && selectedDestState && (
                  <p className="text-xs text-indigo-600 mb-2 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Universities in/around {selectedDestCity.name}, {selectedDestState.name}
                    {universitiesLoading && <span className="ml-2 text-blue-500">(Loading...)</span>}
                  </p>
                )}
                <select
                  value={destUniversityId || ''}
                  onChange={(e) => handleUniversityChange(e.target.value)}
                  disabled={!destCityId || !selectedDestState || universitiesLoading}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium bg-white cursor-pointer appearance-none ${
                    !destCityId || !selectedDestState || universitiesLoading ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="">Select University</option>
                  {universitiesLoading && (
                    <option value="" disabled>Loading universities...</option>
                  )}
                  {!universitiesLoading && universities.length === 0 && destCityId && selectedDestState && (
                    <option value="" disabled>
                      No universities found for {selectedDestState.name}, {selectedDestCountry?.name}
                    </option>
                  )}
                  {universities.map((university) => (
                    <option key={university.id || university.name} value={university.name || university.value}>
                      {university.name}
                    </option>
                  ))}
                </select>
                {universities.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Found {universities.length} {universities.length === 1 ? 'university' : 'universities'}
                  </p>
                )}
              </div>
            </div>
            <input type="hidden" {...register('end_location')} />
            {errors.end_location && (
              <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.end_location.message}
              </p>
            )}
          </div>

          {/* Route Summary Card */}
          {(totalDistance || totalDuration) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-500 p-3 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Route Distance</p>
                    <p className="text-2xl font-bold text-gray-900">{totalDistance ? formatDistance(totalDistance) : 'Calculating...'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-500 p-3 rounded-xl">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Estimated Duration</p>
                    <p className="text-2xl font-bold text-gray-900">{totalDuration ? formatDuration(totalDuration) : 'Calculating...'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stops Management Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Route Stops</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {stops.length === 0 
                    ? 'Add stops along the route (optional). If no stops are added, route will be direct from start to end location.'
                    : 'Add stops along the route between start and end locations'}
                </p>
              </div>
              <button
                type="button"
                onClick={addStop}
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Stop
              </button>
            </div>

            {stops.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center">
                <MapPinIcon className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium text-lg">No stops added</p>
                <p className="text-sm text-gray-500 mt-1">Route will go directly from start to end location</p>
                <p className="text-xs text-gray-400 mt-2">Distance and time will be automatically calculated</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                {/* Stops Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">#</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Stop Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Address</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Distance</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Time</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">To</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stops.map((stop, index) => (
                        <tr key={stop.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full font-bold text-sm">
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={stop.name}
                              onChange={(e) => updateStop(stop.id, 'name', e.target.value)}
                              placeholder="Stop name"
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={stop.address}
                              onChange={(e) => updateStop(stop.id, 'address', e.target.value)}
                              placeholder="Stop address"
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {stop.isCalculating ? (
                              <div className="flex items-center justify-center text-blue-600">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </div>
                            ) : stop.distance ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                {formatDistance(stop.distance)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {stop.duration ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                {formatDuration(stop.duration)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-xs font-medium text-gray-600">
                              {index === stops.length - 1 ? 'Destination' : 'Next Stop'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              type="button"
                              onClick={() => removeStop(stop.id)}
                              className="inline-flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Distance & Duration (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Distance (km) <span className="text-gray-400 text-xs">(Auto-calculated)</span>
              </label>
              <input
                {...register('distance', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400 font-medium"
                placeholder="Auto-filled from route calculation"
                readOnly={!!totalDistance}
              />
              {totalDistance && (
                <p className="mt-1 text-xs text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Automatically calculated
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Duration (minutes) <span className="text-gray-400 text-xs">(Auto-calculated)</span>
              </label>
              <input
                {...register('estimated_duration', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400 font-medium"
                placeholder="Auto-filled from route calculation"
                readOnly={!!totalDuration}
              />
              {totalDuration && (
                <p className="mt-1 text-xs text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Automatically calculated
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
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
            </select>
          </div>
        </div>

        {/* Enhanced Actions Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-transparent px-8 py-6 border-t-2 border-gray-100 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/routes')}
            className="px-8 py-4 border-2 border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-lg hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isCalculating}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl font-bold text-lg transform hover:scale-105 active:scale-95 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            {isSubmitting ? (
              <span className="flex items-center relative z-10">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="animate-pulse">Creating Route...</span>
              </span>
            ) : (
              <span className="flex items-center relative z-10">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Route
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}












