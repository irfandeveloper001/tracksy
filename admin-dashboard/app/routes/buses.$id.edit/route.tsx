import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import busService from '../../lib/api/busService';
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

export default function EditBusPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch bus data
  const { data: bus, isLoading } = useQuery({
    queryKey: ['bus', id],
    queryFn: () => busService.getBusById(id!),
    enabled: !!id,
  });

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
        bus_type: bus.bus_type,
        capacity: bus.capacity,
        status: bus.status,
        route_id: bus.route_id || '',
        driver_id: bus.driver_id || '',
      });
    }
  }, [bus, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: BusFormData) => busService.updateBus(id!, data),
    onSuccess: () => {
      toast.success('Bus updated successfully');
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      queryClient.invalidateQueries({ queryKey: ['bus', id] });
      navigate(`/buses/${id}`);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading bus data...</span>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bus not found</p>
        <button
          onClick={() => navigate('/buses')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Buses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/buses/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Bus</h1>
          <p className="mt-1 text-sm text-gray-600">Update bus information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Bus Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bus Number <span className="text-red-500">*</span>
          </label>
          <input
            {...register('bus_number')}
            type="text"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.bus_number ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., BUS-001"
          />
          {errors.bus_number && (
            <p className="mt-1 text-sm text-red-600">{errors.bus_number.message}</p>
          )}
        </div>

        {/* License Plate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            License Plate <span className="text-red-500">*</span>
          </label>
          <input
            {...register('license_plate')}
            type="text"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.license_plate ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., ABC-123"
          />
          {errors.license_plate && (
            <p className="mt-1 text-sm text-red-600">{errors.license_plate.message}</p>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (Seats) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('capacity', { valueAsNumber: true })}
              type="number"
              min="1"
              max="100"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.capacity ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
            )}
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
            <option value="maintenance">Maintenance</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        {/* Route & Driver */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Route (Optional)
            </label>
            <select
              {...register('route_id')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No Route Assigned</option>
              {/* TODO: Fetch routes for dropdown */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Driver (Optional)
            </label>
            <select
              {...register('driver_id')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No Driver Assigned</option>
              {/* TODO: Fetch drivers for dropdown */}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/buses/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : 'Update Bus'}
          </button>
        </div>
      </form>
    </div>
  );
}

