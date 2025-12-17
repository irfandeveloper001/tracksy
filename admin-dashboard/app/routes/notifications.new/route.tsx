import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import alertService from '../../lib/api/alertService';
import toast from 'react-hot-toast';

const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['info', 'warning', 'success', 'error']),
  audience_type: z.enum(['all', 'route', 'driver', 'student', 'custom']),
  audience_ids: z.array(z.string()).optional(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export default function NewNotificationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: 'info',
      audience_type: 'all',
    },
  });

  const audienceType = watch('audience_type');

  const createMutation = useMutation({
    mutationFn: alertService.createNotification,
    onSuccess: (data) => {
      toast.success('✅ Notification created and sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setIsSubmitting(false);
      // Small delay before navigation to show success message
      setTimeout(() => {
      navigate('/alerts');
      }, 1000);
    },
    onError: (error: any) => {
      console.error('❌ Notification creation error:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Failed to create notification. Please check your connection and try again.';
      toast.error(errorMessage);
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: NotificationFormData) => {
    setIsSubmitting(true);
    try {
    createMutation.mutate(data);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-600 via-yellow-700 to-orange-700 p-6 text-white shadow-xl">
        <div className="relative z-10 flex items-center space-x-4">
        <button
          onClick={() => navigate('/alerts')}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
            <ArrowLeftIcon className="h-6 w-6" />
        </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">Send Announcement</h1>
            <p className="text-yellow-100">Create and send notifications to users</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">🔔 Notifications</span>
            </div>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
        {/* Form Header */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Notification Details</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to send a notification</p>
        </div>
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title')}
            type="text"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Notification title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('message')}
            rows={5}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Notification message"
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('type')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* Audience Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audience <span className="text-red-500">*</span>
          </label>
          <select
            {...register('audience_type')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Users</option>
            <option value="route">Specific Route</option>
            <option value="driver">Specific Drivers</option>
            <option value="student">Specific Students</option>
            <option value="custom">Custom Selection</option>
          </select>
        </div>

        {/* Audience Selection (conditional) */}
        {(audienceType === 'route' || audienceType === 'driver' || audienceType === 'student' || audienceType === 'custom') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {audienceType === 'route' ? 'Route' : audienceType === 'driver' ? 'Drivers' : 'Students'}
            </label>
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <p className="text-sm text-gray-500">
                {audienceType === 'route' && 'Route selection will be available here'}
                {audienceType === 'driver' && 'Driver selection will be available here'}
                {audienceType === 'student' && 'Student selection will be available here'}
                {audienceType === 'custom' && 'Custom audience selection will be available here'}
              </p>
              {/* TODO: Implement audience selection component */}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
            <strong>Note:</strong> The notification will be sent immediately after creation. You can schedule notifications in the future.
          </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/alerts')}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 active:scale-95"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Announcement
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

