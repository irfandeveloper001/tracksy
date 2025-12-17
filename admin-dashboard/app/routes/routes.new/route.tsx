import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import routeService from '../../lib/api/routeService';
import toast from 'react-hot-toast';

const routeSchema = z.object({
  name: z.string().min(1, 'Route name is required'),
  start_location: z.string().min(1, 'Start location is required'),
  end_location: z.string().min(1, 'End location is required'),
  start_point: z.string().optional(), // Backend might use this
  end_point: z.string().optional(), // Backend might use this
  start_latitude: z.number().optional(),
  start_longitude: z.number().optional(),
  end_latitude: z.number().optional(),
  end_longitude: z.number().optional(),
  distance: z.number().optional(),
  estimated_duration: z.number().optional(),
  status: z.enum(['active', 'inactive']),
  is_active: z.boolean().optional(), // Backend might use this
});

type RouteFormData = z.infer<typeof routeSchema>;

export default function NewRoutePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      status: 'active', // Default to active so student/driver apps can see it
    },
  });

  const createMutation = useMutation({
    mutationFn: (routeData: any) => routeService.createRoute(routeData),
    onSuccess: (data) => {
      toast.success('✅ Route created successfully and saved to database!');
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setIsSubmitting(false);
      // Small delay before navigation to show success message
      setTimeout(() => {
      navigate(`/routes/${data.id}`);
      }, 1000);
    },
    onError: (error: any) => {
      console.error('❌ Route creation error:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Failed to create route. Please check your connection and try again.';
      toast.error(errorMessage);
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: RouteFormData) => {
    setIsSubmitting(true);
    try {
      // Map form data - works for both Supabase and API
      // Supabase uses: name, origin, destination, status
      // API uses: name, start_point, end_point, is_active
      const routeData: any = {
        name: data.name.trim(),
        start_location: data.start_location.trim(), // For Supabase (maps to origin)
        end_location: data.end_location.trim(), // For Supabase (maps to destination)
        start_point: data.start_location.trim(), // For API fallback
        end_point: data.end_location.trim(), // For API fallback
        status: data.status, // For Supabase
        is_active: data.status === 'active', // For API fallback
      };
      
      // Add optional fields only if they're provided
      if (data.start_latitude !== undefined && data.start_latitude !== null) {
        routeData.start_latitude = data.start_latitude;
      }
      if (data.start_longitude !== undefined && data.start_longitude !== null) {
        routeData.start_longitude = data.start_longitude;
      }
      if (data.end_latitude !== undefined && data.end_latitude !== null) {
        routeData.end_latitude = data.end_latitude;
      }
      if (data.end_longitude !== undefined && data.end_longitude !== null) {
        routeData.end_longitude = data.end_longitude;
      }
      if (data.distance !== undefined && data.distance !== null) {
        routeData.distance = data.distance;
      }
      if (data.estimated_duration !== undefined && data.estimated_duration !== null) {
        routeData.estimated_duration = data.estimated_duration;
      }
      
      console.log('🛣️ Creating route with data:', routeData);
      console.log('📝 Calling createMutation.mutate...');
      createMutation.mutate(routeData);
      console.log('✅ Mutation called successfully');
    } catch (error) {
      console.error('❌ Error in onSubmit:', error);
      toast.error('Failed to create route. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 p-6 text-white shadow-xl">
        <div className="relative z-10 flex items-center space-x-4">
        <button
          onClick={() => navigate('/routes')}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
            <ArrowLeftIcon className="h-6 w-6" />
        </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">Create New Route</h1>
            <p className="text-green-100">Define a new bus route for your fleet</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">🗺️ Route Management</span>
            </div>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
        {/* Form Header */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Route Information</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new route</p>
        </div>
        {/* Route Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Route Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
              errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="e.g., Downtown to University"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span> {errors.name.message}
            </p>
          )}
        </div>

        {/* Start & End Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Location <span className="text-red-500">*</span>
            </label>
            <input
              {...register('start_location')}
              type="text"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                errors.start_location ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="e.g., Downtown Station"
            />
            {errors.start_location && (
              <p className="mt-1 text-sm text-red-600">{errors.start_location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Location <span className="text-red-500">*</span>
            </label>
            <input
              {...register('end_location')}
              type="text"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                errors.end_location ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="e.g., University Campus"
            />
            {errors.end_location && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span> {errors.end_location.message}
              </p>
            )}
          </div>
        </div>

        {/* Coordinates (Optional) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Latitude (Optional)
            </label>
            <input
              {...register('start_latitude', { valueAsNumber: true })}
              type="number"
              step="any"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Longitude (Optional)
            </label>
            <input
              {...register('start_longitude', { valueAsNumber: true })}
              type="number"
              step="any"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Latitude (Optional)
            </label>
            <input
              {...register('end_latitude', { valueAsNumber: true })}
              type="number"
              step="any"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Longitude (Optional)
            </label>
            <input
              {...register('end_longitude', { valueAsNumber: true })}
              type="number"
              step="any"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Distance & Duration (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance (km) - Optional
            </label>
            <input
              {...register('distance', { valueAsNumber: true })}
              type="number"
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Duration (minutes) - Optional
            </label>
            <input
              {...register('estimated_duration', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            {...register('status')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="inactive">Inactive</option>
            <option value="active">Active</option>
          </select>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                <strong>Note:</strong> The route will be saved to the database and will be immediately available. You can add stops to this route after creating it on the route detail page.
          </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/routes')}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 active:scale-95"
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
                Create Route
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
