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
      toast.success('Notification created successfully');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      navigate('/alerts');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create notification');
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: NotificationFormData) => {
    setIsSubmitting(true);
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/alerts')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Send Notification</h1>
          <p className="mt-1 text-sm text-gray-600">Create and send a notification to users</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
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

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> The notification will be sent immediately after creation. You can schedule notifications in the future.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/alerts')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </form>
    </div>
  );
}

