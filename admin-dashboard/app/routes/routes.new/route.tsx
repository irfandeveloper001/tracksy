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
      // Map form data to Laravel API format
      const routeData: any = {
        name: data.name.trim(),
        start_location: data.start_location.trim(),
        end_location: data.end_location.trim(),
        start_point: data.start_location.trim(), // Laravel uses start_point
        end_point: data.end_location.trim(), // Laravel uses end_point
        status: data.status,
      };
      
      // Add optional fields only if they're provided
      if (data.distance !== undefined && data.distance !== null && data.distance > 0) {
        routeData.distance = data.distance;
      }
      if (data.estimated_duration !== undefined && data.estimated_duration !== null && data.estimated_duration > 0) {
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
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Form Header with gradient */}
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-b border-gray-200 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
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
        
        <div className="p-8 space-y-6">
        {/* Route Name */}
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
            <span className="bg-green-100 text-green-700 rounded-lg px-2 py-1 mr-2 text-xs font-semibold">REQUIRED</span>
            Route Name <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <input
              {...register('name')}
              type="text"
              className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all text-lg font-medium ${
                errors.name ? 'border-red-500 bg-red-50 animate-pulse' : 'border-gray-300 hover:border-green-400 focus:shadow-lg'
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

        {/* Start & End Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <span className="bg-green-100 text-green-700 rounded-lg px-2 py-1 mr-2 text-xs font-semibold">REQUIRED</span>
              Start Location <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                {...register('start_location')}
                type="text"
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all text-lg font-medium ${
                  errors.start_location ? 'border-red-500 bg-red-50 animate-pulse' : 'border-gray-300 hover:border-green-400 focus:shadow-lg'
                }`}
                placeholder="e.g., Downtown Station"
              />
            </div>
            {errors.start_location && (
              <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.start_location.message}
              </p>
            )}
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <span className="bg-green-100 text-green-700 rounded-lg px-2 py-1 mr-2 text-xs font-semibold">REQUIRED</span>
              End Location <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                {...register('end_location')}
                type="text"
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all text-lg font-medium ${
                  errors.end_location ? 'border-red-500 bg-red-50 animate-pulse' : 'border-gray-300 hover:border-green-400 focus:shadow-lg'
                }`}
                placeholder="e.g., University Campus"
              />
            </div>
            {errors.end_location && (
              <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.end_location.message}
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
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-l-4 border-green-500 rounded-xl p-5 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="bg-green-100 rounded-full p-2">
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-green-900 mb-1">Route Creation</h4>
              <p className="text-sm text-green-800">
                The route will be saved to the Laravel database and will be immediately available. You can add stops to this route after creating it on the route detail page.
              </p>
            </div>
          </div>
        </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/routes')}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:via-green-800 hover:to-emerald-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-bold transform hover:scale-105 active:scale-95 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Create Route</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
