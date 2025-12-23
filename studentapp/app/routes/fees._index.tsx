import { useState, useEffect } from "react";
import { Link } from "react-router";
import DashboardLayout from "../components/layout/DashboardLayout";
import feeService from "../lib/api/feeService";
import authService from "../lib/api/authService";
import toast from "react-hot-toast";
import {
  BanknotesIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function Fees() {
  const [user, setUser] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, feesData, statsData] = await Promise.all([
        authService.me(),
        feeService.getFees(),
        feeService.getStatistics(),
      ]);
      setUser(userData);
      setFees(feesData);
      setStatistics(statsData);
    } catch (error: any) {
      toast.error("Failed to load fees");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'overdue': return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default: return <ClockIcon className="w-5 h-5 text-yellow-600" />;
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

  const handleDownloadInvoice = async (feeId: number) => {
    try {
      await feeService.downloadInvoice(feeId);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading fees...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-gray-600 mt-1">Manage your fees and payments</p>
          </div>
          <Link
            to="/fees/payment-history"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Payment History</span>
          </Link>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Fees</p>
                  <p className="text-3xl font-bold mt-2">${parseFloat(statistics.total_fees || 0).toFixed(2)}</p>
                </div>
                <BanknotesIcon className="w-12 h-12 text-blue-200 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Paid</p>
                  <p className="text-3xl font-bold mt-2">${parseFloat(statistics.total_paid || 0).toFixed(2)}</p>
                </div>
                <CheckCircleIcon className="w-12 h-12 text-green-200 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Pending</p>
                  <p className="text-3xl font-bold mt-2">${parseFloat(statistics.pending_fees || 0).toFixed(2)}</p>
                </div>
                <ClockIcon className="w-12 h-12 text-yellow-200 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Overdue</p>
                  <p className="text-3xl font-bold mt-2">${parseFloat(statistics.overdue_fees || 0).toFixed(2)}</p>
                </div>
                <ExclamationTriangleIcon className="w-12 h-12 text-red-200 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Fees List */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Your Fees</h2>
          </div>
          <div className="p-6">
            {fees.length === 0 ? (
              <div className="text-center py-12">
                <BanknotesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No fees found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fees.map((fee) => (
                  <div
                    key={fee.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(fee.status)}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {fee.fee_type.charAt(0).toUpperCase() + fee.fee_type.slice(1)} Fee
                          </h3>
                          <p className="text-sm text-gray-600">{fee.description}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(fee.status)}`}>
                        {fee.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Semester</p>
                        <p className="font-semibold text-gray-900">{fee.semester || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-semibold text-gray-900">${parseFloat(fee.amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Paid</p>
                        <p className="font-semibold text-green-600">${parseFloat(fee.total_paid).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Balance</p>
                        <p className="font-semibold text-red-600">${parseFloat(fee.remaining_balance).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Due: {new Date(fee.due_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadInvoice(fee.id)}
                          className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <DocumentArrowDownIcon className="w-5 h-5" />
                          <span>Invoice</span>
                        </button>
                        {fee.status !== 'paid' && (
                          <Link
                            to={`/fees/${fee.id}/pay`}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1"
                          >
                            <CreditCardIcon className="w-5 h-5" />
                            <span>Pay Now</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}