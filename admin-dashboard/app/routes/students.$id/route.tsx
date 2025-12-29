import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  AcademicCapIcon,
  PencilIcon,
  KeyIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import userService from '../../lib/api/userService';
import BookingHistory from '../../components/students/BookingHistory';
import toast from 'react-hot-toast';
import Modal from '~/components/ui/Modal';
import Input from '~/components/ui/Input';
import Button from '~/components/ui/Button';
import Card from '~/components/ui/Card';

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_id: '',
    phone: '',
    institution: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  // Fetch student details
  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => userService.getStudentById(id!),
    enabled: !!id,
    refetchInterval: 30000,
  });

  // Fetch booking history
  const { data: bookingHistory } = useQuery({
    queryKey: ['student-bookings', id],
    queryFn: () => userService.getStudentBookingHistory(id!, 1, 10),
    enabled: !!id,
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: () => userService.resetStudentPassword(id!),
    onSuccess: () => {
      toast.success('Password reset email sent to student');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: (payload: Partial<typeof formData>) =>
      userService.updateStudent(id!, payload),
    onSuccess: () => {
      toast.success('Student updated successfully');
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsEditOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update student');
    },
  });

  useEffect(() => {
    if (!student) return;
    setFormData({
      name: student.name || '',
      email: student.email || '',
      student_id: student.student_id || '',
      phone: student.phone || '',
      institution: student.institution || '',
      status: student.status || 'active',
    });
  }, [student]);

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateStudentMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      student_id: formData.student_id.trim(),
      phone: formData.phone.trim() || undefined,
      institution: formData.institution.trim() || undefined,
      status: formData.status,
    });
  };

  const memberSince = student?.created_at ? new Date(student.created_at) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading student details...</span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found</p>
        <button
          onClick={() => navigate('/students')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/students')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
            <p className="mt-1 text-sm text-gray-600">Student ID: {student.student_id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => resetPasswordMutation.mutate()}
            disabled={resetPasswordMutation.isPending}
            className="bg-slate-200 text-slate-700 hover:bg-slate-300"
          >
            <KeyIcon className="h-5 w-5 mr-2" />
            Reset Password
          </Button>
          <Button
            onClick={() => setIsEditOpen(true)}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Student
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Student Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Information */}
          <Card className="bg-white/90">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{student.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{student.email}</p>
                </div>
              </div>

              {student.phone && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{student.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="font-medium text-gray-900">{student.student_id}</p>
                </div>
              </div>

              {student.institution && (
                <div className="flex items-center space-x-3">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Institution</p>
                    <p className="font-medium text-gray-900">{student.institution}</p>
                  </div>
                </div>
              )}

              {student.route_name && (
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Assigned Route</p>
                    <p className="font-medium text-gray-900">{student.route_name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.status === 'active'
                        ? 'bg-slate-100 text-slate-700'
                        : student.status === 'suspended'
                        ? 'bg-slate-300 text-slate-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {student.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {memberSince ? memberSince.toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Booking History */}
        <div className="lg:col-span-2">
          <Card className="bg-white/90">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking History</h2>
            <BookingHistory bookings={bookingHistory?.bookings || []} />
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Student"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
            Update student details to keep routing, billing, and communication accurate.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Student ID"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Institution"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as typeof formData.status })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={updateStudentMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
