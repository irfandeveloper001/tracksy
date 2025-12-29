import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  ArrowLeftIcon, 
  MapIcon, 
  UserIcon, 
  TruckIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import alertService from '../../lib/api/alertService';
import routeService from '../../lib/api/routeService';
import userService from '../../lib/api/userService';
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
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: 'info',
      audience_type: 'all',
      audience_ids: [],
    },
  });

  const audienceType = watch('audience_type');

  // Fetch routes from Laravel API
  const { data: routesData, isLoading: isLoadingRoutes } = useQuery({
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
  });

  // Fetch drivers from Laravel API
  const { data: driversData, isLoading: isLoadingDrivers } = useQuery({
    queryKey: ['drivers', 'all'],
    queryFn: async () => {
      try {
        const result = await userService.getDrivers(1, 100);
        return result;
      } catch (error) {
        console.warn('⚠️ Failed to fetch drivers:', error);
        return { users: [], total: 0 };
      }
    },
  });

  // Fetch students from Laravel API
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', 'all'],
    queryFn: async () => {
      try {
        const result = await userService.getStudents(1, 100);
        return result;
      } catch (error) {
        console.warn('⚠️ Failed to fetch students:', error);
        return { users: [], total: 0 };
      }
    },
  });

  const routes = routesData?.routes || [];
  const drivers = driversData?.users || [];
  const students = studentsData?.users || [];

  const createMutation = useMutation({
    mutationFn: alertService.createNotification,
    onSuccess: (data) => {
      console.log('✅ Notification created successfully:', data);
      const totalSent = data?.total_sent || data?.notifications?.length || 0;
      toast.success(`✅ Notification sent successfully to ${totalSent} recipient${totalSent !== 1 ? 's' : ''}!`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setIsSubmitting(false);
      // Small delay before navigation to show success message
      setTimeout(() => {
        navigate('/alerts');
      }, 1500);
    },
    onError: (error: any) => {
      console.error('❌ Notification creation error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Extract error message
      let errorMessage = 'Failed to create notification. Please check your connection and try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Laravel validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        errorMessage = errorMessages.join(', ');
      }
      
      toast.error(errorMessage, { duration: 5000 });
      setIsSubmitting(false);
    },
  });

  const handleRouteToggle = (routeId: string) => {
    const newSelected = selectedRoutes.includes(routeId)
      ? selectedRoutes.filter(id => id !== routeId)
      : [...selectedRoutes, routeId];
    setSelectedRoutes(newSelected);
    setValue('audience_ids', newSelected);
  };

  const handleDriverToggle = (driverId: string) => {
    const newSelected = selectedDrivers.includes(driverId)
      ? selectedDrivers.filter(id => id !== driverId)
      : [...selectedDrivers, driverId];
    setSelectedDrivers(newSelected);
    setValue('audience_ids', newSelected);
  };

  const handleStudentToggle = (studentId: string) => {
    const newSelected = selectedStudents.includes(studentId)
      ? selectedStudents.filter(id => id !== studentId)
      : [...selectedStudents, studentId];
    setSelectedStudents(newSelected);
    setValue('audience_ids', newSelected);
  };

  const onSubmit = async (data: NotificationFormData) => {
    console.log('📝 Form submitted with data:', data);
    console.log('📝 Audience type:', audienceType);
    console.log('📝 Selected routes:', selectedRoutes);
    console.log('📝 Selected drivers:', selectedDrivers);
    console.log('📝 Selected students:', selectedStudents);
    
    setIsSubmitting(true);
    try {
      // Ensure audience_ids is set based on selected items
      let audienceIds: string[] = [];
      if (audienceType === 'route') {
        audienceIds = selectedRoutes;
      } else if (audienceType === 'driver') {
        audienceIds = selectedDrivers;
      } else if (audienceType === 'student') {
        audienceIds = selectedStudents;
      } else if (audienceType === 'custom') {
        audienceIds = [...selectedRoutes, ...selectedDrivers, ...selectedStudents];
      }

      // Validate that audience_ids is provided when needed
      if (audienceType !== 'all' && audienceIds.length === 0) {
        toast.error('Please select at least one item for the selected audience type');
        setIsSubmitting(false);
        return;
      }

      const notificationData = {
        title: data.title.trim(),
        message: data.message.trim(),
        type: data.type,
        audience_type: data.audience_type,
        audience_ids: audienceType === 'all' ? undefined : audienceIds.map(id => String(id)),
      };

      console.log('📤 Sending notification data:', notificationData);
      console.log('📤 Audience IDs (converted):', notificationData.audience_ids);
      
      createMutation.mutate(notificationData, {
        onSettled: () => {
          console.log('📤 Mutation settled (completed or failed)');
        },
      });
    } catch (error: any) {
      console.error('❌ Error in onSubmit:', error);
      toast.error(error.message || 'An unexpected error occurred');
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
      <form 
        onSubmit={(e) => {
          console.log('📋 Form onSubmit event fired');
          handleSubmit(onSubmit)(e);
        }} 
        className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
        noValidate
      >
        {/* Form Header with gradient */}
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border-b border-gray-200 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Notification Details</h2>
              <p className="text-sm text-gray-600 mt-1">Fill in the details to send a notification</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
        {/* Title */}
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
            <span className="bg-yellow-100 text-yellow-700 rounded-lg px-2 py-1 mr-2 text-xs font-semibold">REQUIRED</span>
            Title <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <input
              {...register('title')}
              type="text"
              className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-lg font-medium ${
                errors.title ? 'border-red-500 bg-red-50 animate-pulse' : 'border-gray-300 hover:border-yellow-400 focus:shadow-lg'
              }`}
              placeholder="Enter notification title"
            />
          </div>
          {errors.title && (
            <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 rounded-lg px-3 py-2 border border-red-200">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
            <span className="bg-yellow-100 text-yellow-700 rounded-lg px-2 py-1 mr-2 text-xs font-semibold">REQUIRED</span>
            Message <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            {...register('message')}
            rows={6}
            className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-base font-medium resize-none ${
              errors.message ? 'border-red-500 bg-red-50 animate-pulse' : 'border-gray-300 hover:border-yellow-400 focus:shadow-lg'
            }`}
            placeholder="Enter notification message..."
          />
          {errors.message && (
            <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 rounded-lg px-3 py-2 border border-red-200">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Type and Audience in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <span className="bg-yellow-100 text-yellow-700 rounded-lg px-2 py-1 mr-2 text-xs font-semibold">REQUIRED</span>
              Type <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              {...register('type')}
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium text-base"
            >
              <option value="info">ℹ️ Info</option>
              <option value="warning">⚠️ Warning</option>
              <option value="success">✅ Success</option>
              <option value="error">❌ Error</option>
            </select>
          </div>

          {/* Audience Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <span className="bg-yellow-100 text-yellow-700 rounded-lg px-2 py-1 mr-2 text-xs font-semibold">REQUIRED</span>
              Audience <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              {...register('audience_type')}
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium text-base"
            >
              <option value="all">👥 All Users</option>
              <option value="route">🗺️ Specific Route</option>
              <option value="driver">🚌 Specific Drivers</option>
              <option value="student">🎓 Specific Students</option>
              <option value="custom">⚙️ Custom Selection</option>
            </select>
          </div>
        </div>

        {/* Audience Selection (conditional) */}
        {audienceType === 'route' && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <MapIcon className="h-5 w-5 mr-2 text-purple-600" />
              Select Routes <span className="text-red-500 ml-1">*</span>
              {selectedRoutes.length > 0 && (
                <span className="ml-auto px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  {selectedRoutes.length} selected
                </span>
              )}
            </label>
            {isLoadingRoutes ? (
              <div className="flex items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading routes...</span>
              </div>
            ) : routes.length === 0 ? (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                <MapIcon className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-sm text-yellow-800 font-medium">No routes available</p>
                <p className="text-xs text-yellow-600 mt-1">Create routes first to send notifications</p>
              </div>
            ) : (
              <div className="border-2 border-gray-300 rounded-xl max-h-64 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {routes.map((route) => {
                    const isSelected = selectedRoutes.includes(route.id);
                    return (
                      <div
                        key={route.id}
                        onClick={() => handleRouteToggle(route.id)}
                        className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                          isSelected ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'bg-purple-600 border-purple-600' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{route.name}</h4>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  {route.start_point || route.start_location || 'N/A'}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="flex items-center">
                                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                  {route.end_point || route.end_location || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            route.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {route.status || 'inactive'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {errors.audience_ids && (
              <p className="mt-2 text-sm text-red-600">{errors.audience_ids.message}</p>
            )}
          </div>
        )}

        {audienceType === 'driver' && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <TruckIcon className="h-5 w-5 mr-2 text-blue-600" />
              Select Drivers <span className="text-red-500 ml-1">*</span>
              {selectedDrivers.length > 0 && (
                <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {selectedDrivers.length} selected
                </span>
              )}
            </label>
            {isLoadingDrivers ? (
              <div className="flex items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading drivers...</span>
              </div>
            ) : drivers.length === 0 ? (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                <TruckIcon className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-sm text-yellow-800 font-medium">No drivers available</p>
              </div>
            ) : (
              <div className="border-2 border-gray-300 rounded-xl max-h-64 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {drivers.map((driver) => {
                    const isSelected = selectedDrivers.includes(driver.id);
                    return (
                      <div
                        key={driver.id}
                        onClick={() => handleDriverToggle(driver.id)}
                        className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                          isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{driver.name || driver.email}</h4>
                              <p className="text-sm text-gray-600 mt-1">{driver.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            driver.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {driver.status || 'inactive'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {audienceType === 'student' && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-green-600" />
              Select Students <span className="text-red-500 ml-1">*</span>
              {selectedStudents.length > 0 && (
                <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  {selectedStudents.length} selected
                </span>
              )}
            </label>
            {isLoadingStudents ? (
              <div className="flex items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Loading students...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                <UserIcon className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-sm text-yellow-800 font-medium">No students available</p>
              </div>
            ) : (
              <div className="border-2 border-gray-300 rounded-xl max-h-64 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {students.map((student) => {
                    const isSelected = selectedStudents.includes(student.id);
                    return (
                      <div
                        key={student.id}
                        onClick={() => handleStudentToggle(student.id)}
                        className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                          isSelected ? 'bg-green-50 border-l-4 border-green-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'bg-green-600 border-green-600' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{student.name || student.email}</h4>
                              <p className="text-sm text-gray-600 mt-1">{student.email} • {student.student_id || 'N/A'}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            student.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {student.status || 'inactive'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {audienceType === 'custom' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium">
                Select from routes, drivers, and students below
              </p>
            </div>
            
            {/* Routes Section */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Routes
              </label>
              <div className="border-2 border-gray-300 rounded-xl max-h-48 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {routes.slice(0, 5).map((route) => {
                    const isSelected = selectedRoutes.includes(route.id);
                    return (
                      <div
                        key={route.id}
                        onClick={() => handleRouteToggle(route.id)}
                        className={`p-3 cursor-pointer transition-all hover:bg-gray-50 ${
                          isSelected ? 'bg-purple-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckIcon className="h-2.5 w-2.5 text-white" />}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{route.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drivers Section */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Drivers
              </label>
              <div className="border-2 border-gray-300 rounded-xl max-h-48 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {drivers.slice(0, 5).map((driver) => {
                    const isSelected = selectedDrivers.includes(driver.id);
                    return (
                      <div
                        key={driver.id}
                        onClick={() => handleDriverToggle(driver.id)}
                        className={`p-3 cursor-pointer transition-all hover:bg-gray-50 ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckIcon className="h-2.5 w-2.5 text-white" />}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{driver.name || driver.email}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Students Section */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Students
              </label>
              <div className="border-2 border-gray-300 rounded-xl max-h-48 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {students.slice(0, 5).map((student) => {
                    const isSelected = selectedStudents.includes(student.id);
                    return (
                      <div
                        key={student.id}
                        onClick={() => handleStudentToggle(student.id)}
                        className={`p-3 cursor-pointer transition-all hover:bg-gray-50 ${
                          isSelected ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckIcon className="h-2.5 w-2.5 text-white" />}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{student.name || student.email}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border-l-4 border-yellow-500 rounded-xl p-5 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="bg-yellow-100 rounded-full p-2">
                <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-yellow-900 mb-1">Notification Delivery</h4>
              <p className="text-sm text-yellow-800">
                The notification will be sent immediately after creation to all selected recipients. You can schedule notifications in the future.
              </p>
            </div>
          </div>
        </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/alerts')}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (audienceType !== 'all' && 
              (audienceType === 'route' && selectedRoutes.length === 0) ||
              (audienceType === 'driver' && selectedDrivers.length === 0) ||
              (audienceType === 'student' && selectedStudents.length === 0) ||
              (audienceType === 'custom' && selectedRoutes.length === 0 && selectedDrivers.length === 0 && selectedStudents.length === 0)
            )}
            onClick={(e) => {
              console.log('🔘 Send Announcement button clicked');
              console.log('🔘 Button disabled?', isSubmitting || (audienceType !== 'all' && 
                (audienceType === 'route' && selectedRoutes.length === 0) ||
                (audienceType === 'driver' && selectedDrivers.length === 0) ||
                (audienceType === 'student' && selectedStudents.length === 0) ||
                (audienceType === 'custom' && selectedRoutes.length === 0 && selectedDrivers.length === 0 && selectedStudents.length === 0)
              ));
            }}
            className="px-8 py-3 bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-700 text-white rounded-xl hover:from-yellow-700 hover:via-orange-700 hover:to-yellow-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-bold transform hover:scale-105 active:scale-95 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Send Announcement</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

