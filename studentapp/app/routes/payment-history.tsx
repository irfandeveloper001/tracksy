import { useState, useEffect } from "react";
import { Link } from "react-router";
import DashboardLayout from "../components/layout/DashboardLayout";
import feeService from "../lib/api/feeService";
import authService from "../lib/api/authService";
import toast from "react-hot-toast";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

export default function PaymentHistory() {
  const [user, setUser] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, paymentsData] = await Promise.all([
        authService.me(),
        feeService.getPaymentHistory(),
      ]);
      setUser(userData);
      setPayments(paymentsData);
    } catch (error) {
      console.error("Failed to load payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      case "pending":
        return <ClockIcon className="w-6 h-6 text-yellow-600" />;
      case "failed":
        return <XCircleIcon className="w-6 h-6 text-red-600" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDownloadReceipt = async (paymentId: number, status: string) => {
    if (status !== 'completed') {
      toast.error('Receipt is only available for completed payments');
      return;
    }

    try {
      await feeService.downloadReceipt(paymentId);
      toast.success("Receipt downloaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to download receipt");
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading payment history...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Payment History
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              View all your payment transactions
            </p>
          </div>
          <Link
            to="/fees"
            className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base flex-shrink-0 text-center"
          >
            Back to Fees
          </Link>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full mb-4">
                <CreditCardIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <p className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No payment history</p>
              <p className="text-sm text-gray-500">
                Your payment transactions will appear here once you make a payment
              </p>
              <Link
                to="/fees"
                className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Go to Fees
              </Link>
            </div>
          ) : (
            <>
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{payments.length}</span> payment{payments.length !== 1 ? 's' : ''} found
                  </p>
                  <p className="text-sm text-gray-600">
                    Total: <span className="font-bold text-indigo-600">${payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)}</span>
                  </p>
                </div>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Fee Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(payment.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.fee?.fee_type
                            ? payment.fee.fee_type.charAt(0).toUpperCase() +
                              payment.fee.fee_type.slice(1)
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ${parseFloat(payment.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                            {payment.payment_method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                          {payment.transaction_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              payment.status
                            )}`}
                          >
                            {payment.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDownloadReceipt(payment.id, payment.status)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 hover:bg-indigo-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title={payment.status === 'completed' ? "Download Receipt" : "Receipt only available for completed payments"}
                            disabled={payment.status !== 'completed'}
                          >
                            <DocumentArrowDownIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          {getStatusIcon(payment.status)}
                          <h3 className="ml-2 text-sm font-bold text-gray-900">
                            {payment.fee?.fee_type
                              ? payment.fee.fee_type.charAt(0).toUpperCase() +
                                payment.fee.fee_type.slice(1)
                              : "Payment"}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 ml-7">
                          {new Date(payment.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-7 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Amount:</span>
                        <span className="text-sm font-bold text-gray-900">${parseFloat(payment.amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Method:</span>
                        <span className="text-xs text-gray-900 capitalize">{payment.payment_method}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Transaction ID:</span>
                        <span className="text-xs font-mono text-gray-600 truncate ml-2 max-w-[120px]">{payment.transaction_id}</span>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => handleDownloadReceipt(payment.id, payment.status)}
                          className={`flex items-center text-xs font-medium transition-colors ${
                            payment.status === 'completed'
                              ? 'text-indigo-600 hover:text-indigo-900'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          title={payment.status === 'completed' ? "Download Receipt" : "Receipt only available for completed payments"}
                          disabled={payment.status !== 'completed'}
                        >
                          <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                          Download Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

