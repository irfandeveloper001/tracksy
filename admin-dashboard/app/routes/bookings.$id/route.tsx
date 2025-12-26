import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import bookingService, { type Booking } from '../../lib/api/bookingService';
import Modal from '~/components/ui/Modal';
import Button from '~/components/ui/Button';
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    try {
      const data = await bookingService.getBooking(parseInt(id!));
      setBooking(data);
    } catch (error: any) {
      console.error('Failed to load booking:', error);
      toast.error(error.message || 'Failed to load booking details');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await bookingService.approveBooking(parseInt(id!));
      toast.success('Booking approved successfully! Student will be notified.');
      setShowApproveModal(false);
      loadBooking();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve booking');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      await bookingService.rejectBooking(parseInt(id!), rejectionReason.trim());
      toast.success('Booking rejected successfully! Student will be notified.');
      setShowRejectModal(false);
      setRejectionReason('');
      loadBooking();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject booking');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="w-8 h-8 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="w-8 h-8 text-red-600" />;
      case 'pending':
        return <ClockIcon className="w-8 h-8 text-yellow-600" />;
      case 'cancelled':
        return <XCircleIcon className="w-8 h-8 text-gray-600" />;
      case 'completed':
        return <CheckCircleIcon className="w-8 h-8 text-blue-600" />;
      default:
        return <ClockIcon className="w-8 h-8 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading || !booking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-gray-600 mt-1">Reference: {booking.booking_reference}</p>
        </div>
        <button
          onClick={() => navigate('/bookings')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Back to List
        </button>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-6 border-2 ${getStatusColor(booking.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getStatusIcon(booking.status)}
            <div>
              <h2 className="text-2xl font-bold capitalize">{booking.status} Booking</h2>
              <p className="text-sm mt-1">
                {booking.status === 'pending' && 'Waiting for admin approval'}
                {booking.status === 'confirmed' && booking.approved_at && 
                  `Approved on ${new Date(booking.approved_at).toLocaleString()}`}
                {booking.status === 'rejected' && booking.rejected_at && 
                  `Rejected on ${new Date(booking.rejected_at).toLocaleString()}`}
              </p>
            </div>
          </div>
          {booking.status === 'pending' && (
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowApproveModal(true)}
                disabled={processing}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => setShowRejectModal(true)}
                disabled={processing}
                className="bg-slate-600 text-white hover:bg-slate-500"
              >
                <XCircleIcon className="w-5 h-5 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Seat Availability Warning */}
      {booking.status === 'pending' && booking.seat_available === false && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <XCircleIcon className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">
              Warning: This seat may already be reserved for this date. Please verify before approving.
            </p>
          </div>
        </div>
      )}

      {booking.status === 'pending' && booking.seat_available === true && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">
              Seat is available for this date.
            </p>
          </div>
        </div>
      )}

      {/* Booking Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <UserIcon className="w-5 h-5" />
            <span>Student Information</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-gray-900 font-medium">{booking.student?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{booking.student?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Student ID</p>
              <p className="text-gray-900">{booking.student?.student_id || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TicketIcon className="w-5 h-5" />
            <span>Booking Details</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Seat Number</p>
              <p className="text-gray-900 font-medium text-xl">Seat {booking.seat_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Trip Date</p>
              <p className="text-gray-900 flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{new Date(booking.trip_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Booking Reference</p>
              <p className="text-gray-900 font-mono">{booking.booking_reference}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="text-gray-900">{new Date(booking.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Bus Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MapPinIcon className="w-5 h-5" />
            <span>Bus Information</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Bus Name</p>
              <p className="text-gray-900 font-medium">{booking.bus?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bus Number</p>
              <p className="text-gray-900">{booking.bus?.number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="text-gray-900">{booking.bus?.capacity || 'N/A'} seats</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Route</p>
              <p className="text-gray-900">{booking.bus?.currentRoute?.name || 'No route assigned'}</p>
            </div>
          </div>
        </div>

        {/* Approval Information */}
        {(booking.status === 'confirmed' || booking.status === 'rejected') && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {booking.status === 'confirmed' ? 'Approval Information' : 'Rejection Information'}
            </h3>
            <div className="space-y-3">
              {booking.status === 'confirmed' && booking.admin_approved_by_user && (
                <div>
                  <p className="text-sm text-gray-500">Approved By</p>
                  <p className="text-gray-900">{booking.admin_approved_by_user.name}</p>
                </div>
              )}
              {booking.status === 'confirmed' && booking.approved_at && (
                <div>
                  <p className="text-sm text-gray-500">Approved At</p>
                  <p className="text-gray-900">{new Date(booking.approved_at).toLocaleString()}</p>
                </div>
              )}
              {booking.status === 'rejected' && booking.rejection_reason && (
                <div>
                  <p className="text-sm text-gray-500">Rejection Reason</p>
                  <p className="text-gray-900 bg-red-50 p-3 rounded border border-red-200">
                    {booking.rejection_reason}
                  </p>
                </div>
              )}
              {booking.status === 'rejected' && booking.rejected_at && (
                <div>
                  <p className="text-sm text-gray-500">Rejected At</p>
                  <p className="text-gray-900">{new Date(booking.rejected_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Booking"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
            Approve this booking and reserve the seat for the student. A confirmation
            notice will be sent automatically.
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowApproveModal(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleApprove} isLoading={processing}>
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
        }}
        title="Reject Booking"
        size="md"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
            Provide a reason so the student understands the rejection. This message
            is shared in their booking history.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
              placeholder="Enter the reason for rejection..."
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-slate-800 text-white hover:bg-slate-700"
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? 'Rejecting...' : 'Reject Booking'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
