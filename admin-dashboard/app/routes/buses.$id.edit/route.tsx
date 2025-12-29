import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, TruckIcon } from '@heroicons/react/24/outline';
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

export default function BusEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch bus data from Laravel API
  const { data: bus, isLoading } = useQuery({
    queryKey: ['bus', id],
    queryFn: async () => {
      if (!id) throw new Error('Bus ID is required');
      return await busService.getBusById(id);
    },
    enabled: !!id,
  });

  // Fetch routes from Laravel API
  const { data: routesData } = useQuery({
    queryKey: ['routes', 'all'],
    queryFn: async () => {
      try {
        const result = await routeService.getRoutes(1, 100);
        return result;
      } catch (error) {
        console.warn('⚠️ Failed to fetch routes:', error);
        return { routes: [], total: 0 };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch drivers from Laravel API
  const { data: driversData } = useQuery({
    queryKey: ['drivers', 'all'],
    queryFn: async () => {
      try {
        const response = await userService.getDrivers(1, 100);
        return response;
      } catch (error) {
        console.warn('⚠️ Failed to fetch drivers:', error);
        return { users: [], total: 0 };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const routes = routesData?.routes || [];
  const drivers = driversData?.users || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BusFormData>({
    resolver: zodResolver(busSchema),
  });

  // Populate form when bus data loads
  useEffect(() => {
    if (bus) {
      reset({
        bus_number: bus.bus_number,
        license_plate: bus.license_plate,
        bus_type: bus.bus_type as 'standard' | 'premium' | 'luxury',
        capacity: bus.capacity,
        status: bus.status as 'active' | 'inactive' | 'maintenance' | 'emergency',
        route_id: bus.route_id || '',
        driver_id: bus.driver_id || '',
      });
    }
  }, [bus, reset]);

  // Update bus mutation
  const updateMutation = useMutation({
    mutationFn: (data: BusFormData) => {
      if (!id) throw new Error('Bus ID is required');
      return busService.updateBus(id, data);
    },
    onSuccess: () => {
      toast.success('✅ Bus updated successfully!', {
        duration: 3000,
        icon: '🚌',
      });
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      queryClient.invalidateQueries({ queryKey: ['bus', id] });
      setTimeout(() => {
        navigate(`/buses/${id}`);
      }, 1500);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update bus. Please try again.', {
        duration: 4000,
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: BusFormData) => {
    setIsSubmitting(true);
    updateMutation.mutate(data);
  };

  if (isLoading && !bus) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bus data...</p>
        </div>
      </div>
    );
  }

  if (!bus && !isLoading) {
    return (
      <div className="text-center py-20">
        <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center mb-6">
          <TruckIcon className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Bus not found</h3>
        <p className="text-gray-500 mb-6">The bus you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/buses')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ← Back to Buses
        </button>
      </div>
    );
  }

  if (!bus) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/buses/${id}`)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-4xl font-bold">Edit Bus</h1>
              <p className="mt-2 text-white/90 text-lg">Update bus information</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600"></div>
        <div className="p-8 space-y-6">
          {/* Bus Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bus Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register('bus_number')}
              type="text"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.bus_number ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="e.g., BUS-001"
            />
            {errors.bus_number && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.bus_number.message}</p>
            )}
          </div>

          {/* License Plate */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              License Plate <span className="text-red-500">*</span>
            </label>
            <input
              {...register('license_plate')}
              type="text"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.license_plate ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="e.g., ABC-123"
            />
            {errors.license_plate && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.license_plate.message}</p>
            )}
          </div>

          {/* Bus Type & Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bus Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('bus_type')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
              >
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Capacity (Seats) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('capacity', { valueAsNumber: true })}
                type="number"
                min="1"
                max="100"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.capacity ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.capacity && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.capacity.message}</p>
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
            >
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          {/* Route & Driver */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assigned Route (Optional)
              </label>
              <select
                {...register('route_id')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
              >
                <option value="">No Route Assigned</option>
                {routes.length > 0 ? (
                  routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name} {route.status === 'active' ? '✓' : ''}
                    </option>
                  ))
                ) : (
                  <option disabled>No routes available</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assigned Driver (Optional)
              </label>
              <select
                {...register('driver_id')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
              >
                <option value="">No Driver Assigned</option>
                {drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name || driver.email || 'Unnamed Driver'}
                    </option>
                  ))
                ) : (
                  <option disabled>No drivers available</option>
                )}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={() => navigate(`/buses/${id}`)}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </span>
              ) : (
                'Update Bus'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
