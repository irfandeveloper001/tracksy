import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import feeService, { type Fee } from '../../lib/api/feeService';
import {
  BanknotesIcon,
  EnvelopeIcon,
  CreditCardIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

export default function FeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fee, setFee] = useState<Fee | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDueDateModal, setShowDueDateModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'cash',
    transaction_id: '',
    notes: '',
  });
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    loadFee();
  }, [id]);

  const loadFee = async () => {
    try {
      const data = await feeService.getFee(parseInt(id!));
      setFee(data);
      setPaymentData({ ...paymentData, amount: data.remaining_balance.toString() });
      setNewDueDate(data.due_date);
    } catch (error) {
      console.error('Failed to load fee:', error);
      alert('Failed to load fee details');
      navigate('/fees');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feeService.recordPayment(parseInt(id!), {
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.payment_method,
        transaction_id: paymentData.transaction_id || undefined,
        notes: paymentData.notes || undefined,
      });
      alert('Payment recorded successfully!');
      setShowPaymentModal(false);
      loadFee();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleUpdateDueDate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feeService.updateDueDate(parseInt(id!), newDueDate, true);
      alert('Due date updated successfully!');
      setShowDueDateModal(false);
      loadFee();
    } catch (error) {
      alert('Failed to update due date');
    }
  };

  const handleSendInvoice = async () => {
    if (!confirm('Send invoice email to student?')) return;
    
    try {
      await feeService.generateInvoice(parseInt(id!));
      alert('Invoice sent successfully!');
    } catch (error) {
      alert('Failed to send invoice');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon className="w-8 h-8 text-green-600" />;
      case 'overdue': return <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />;
      default: return <ClockIcon className="w-8 h-8 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading || !fee) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading fee details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Details</h1>
          <p className="text-gray-600 mt-1">Fee ID: #{fee.id}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSendInvoice}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <EnvelopeIcon className="w-5 h-5" />
            <span>Send Invoice</span>
          </button>
          <button
            onClick={() => navigate('/fees')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-6 border-2 ${getStatusColor(fee.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getStatusIcon(fee.status)}
            <div>
              <h2 className="text-2xl font-bold capitalize">{fee.status} Fee</h2>
              <p className="text-sm mt-1">{fee.fee_type.charAt(0).toUpperCase() + fee.fee_type.slice(1).replace('_', ' ')} - {fee.semester}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm">Total Amount</p>
            <p className="text-3xl font-bold">${parseFloat(fee.amount.toString()).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <UserIcon className="w-5 h-5" />
            <span>Student Information</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold text-gray-900">{fee.user?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900">{fee.user?.email || 'N/A'}</p>
            </div>
            {fee.user?.student_id && (
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-semibold text-gray-900">{fee.user.student_id}</p>
              </div>
            )}
          </div>
        </div>

        {/* Fee Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <BanknotesIcon className="w-5 h-5" />
            <span>Fee Information</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Fee Type</p>
              <p className="font-semibold text-gray-900 capitalize">{fee.fee_type.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Semester</p>
              <p className="font-semibold text-gray-900">{fee.semester}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">{new Date(fee.due_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <button
                  onClick={() => setShowDueDateModal(true)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            {fee.description && (
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-semibold text-gray-900">{fee.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">${parseFloat(fee.amount.toString()).toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Paid</p>
            <p className="text-2xl font-bold text-green-600">${parseFloat(fee.total_paid.toString()).toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Balance</p>
            <p className="text-2xl font-bold text-red-600">${parseFloat(fee.remaining_balance.toString()).toFixed(2)}</p>
          </div>
        </div>
        
        {fee.status !== 'paid' && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CreditCardIcon className="w-5 h-5" />
            <span>Record Payment</span>
          </button>
        )}
      </div>

      {/* Payment History */}
      {fee.payments && fee.payments.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment History</h3>
          <div className="space-y-3">
            {fee.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">${parseFloat(payment.amount.toString()).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(payment.created_at).toLocaleDateString()} - {payment.payment_method.toUpperCase()}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="text-xs font-mono text-gray-900">{payment.transaction_id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Record Payment</h3>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={paymentData.transaction_id}
                  onChange={(e) => setPaymentData({ ...paymentData, transaction_id: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Auto-generated if empty"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Due Date Modal */}
      {showDueDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Update Due Date</h3>
            <form onSubmit={handleUpdateDueDate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Due Date</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <p className="text-sm text-gray-600">
                A notification will be sent to the student about this due date change.
              </p>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDueDateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Update Due Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

