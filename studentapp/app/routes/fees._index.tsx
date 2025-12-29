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
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    loadData();
    
    // Update current date/time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

  const hasOverdueFees = fees.some(fee => fee.status === 'overdue');

  return (
    <DashboardLayout user={user}>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-1">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your fees and payments</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {currentDateTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} - {currentDateTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>
          <Link
            to="/fees/payment-history"
            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 transform hover:scale-105 text-sm sm:text-base flex-shrink-0"
          >
            <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Payment History</span>
          </Link>
        </div>

        {/* Overdue Warning Banner */}
        {hasOverdueFees && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl p-4 sm:p-6 shadow-lg animate-pulse">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mr-3 sm:mr-4 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-red-900 mb-2">
                  ⚠️ Overdue Fees - Action Required!
                </h3>
                <p className="text-sm sm:text-base text-red-800 mb-3">
                  You have overdue fees that must be paid immediately. Access to bus tracking, routes, and bookings is restricted until all overdue fees are cleared.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <p className="text-red-900 font-semibold text-base sm:text-lg">
                    Total Overdue: ${parseFloat(statistics?.overdue_fees || 0).toFixed(2)}
                  </p>
                  <button
                    onClick={() => {
                      const firstOverdueFee = fees.find(f => f.status === 'overdue');
                      if (firstOverdueFee) {
                        window.location.href = `/fees/${firstOverdueFee.id}/pay`;
                      }
                    }}
                    className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl p-4 sm:p-6 text-white transform hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Fees</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 truncate">${parseFloat(statistics.total_fees || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
                  <BanknotesIcon className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg hover:shadow-xl p-4 sm:p-6 text-white transform hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-green-100 text-xs sm:text-sm font-medium">Total Paid</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 truncate">${parseFloat(statistics.total_paid || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
                  <CheckCircleIcon className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg hover:shadow-xl p-4 sm:p-6 text-white transform hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-yellow-100 text-xs sm:text-sm font-medium">Pending</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 truncate">${parseFloat(statistics.pending_fees || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
                  <ClockIcon className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg hover:shadow-xl p-4 sm:p-6 text-white transform hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-red-100 text-xs sm:text-sm font-medium">Overdue</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 truncate">${parseFloat(statistics.overdue_fees || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
                  <ExclamationTriangleIcon className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fees List */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Your Fees</h2>
          </div>
          <div className="p-4 sm:p-6">
            {fees.length === 0 ? (
              <div className="text-center py-16">
                <BanknotesIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No fees found</p>
                <p className="text-gray-500 text-sm mt-2">You don't have any fees at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fees.map((fee) => (
                  <div
                    key={fee.id}
                    className="border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-indigo-300 transition-all bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getStatusIcon(fee.status)}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                            {fee.fee_type.charAt(0).toUpperCase() + fee.fee_type.slice(1)} Fee
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{fee.description}</p>
                        </div>
                      </div>
                      <span className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold border-2 ${getStatusColor(fee.status)} whitespace-nowrap self-start sm:self-auto`}>
                        {fee.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
                      <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                        <p className="text-xs text-blue-700 font-semibold">Semester</p>
                        <p className="font-bold text-gray-900 mt-1 text-sm sm:text-base truncate">{fee.semester || 'N/A'}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                        <p className="text-xs text-green-700 font-semibold">Amount</p>
                        <p className="font-bold text-gray-900 mt-1 text-sm sm:text-base">${parseFloat(fee.amount).toFixed(2)}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-2 sm:p-3">
                        <p className="text-xs text-emerald-700 font-semibold">Paid</p>
                        <p className="font-bold text-green-600 mt-1 text-sm sm:text-base">${parseFloat(fee.total_paid).toFixed(2)}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2 sm:p-3">
                        <p className="text-xs text-red-700 font-semibold">Balance</p>
                        <p className="font-bold text-red-600 mt-1 text-sm sm:text-base">${parseFloat(fee.remaining_balance).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 sm:pt-4 border-t-2 border-gray-200 gap-3">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">
                        📅 Due: {new Date(fee.due_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleDownloadInvoice(fee.id)}
                          className="px-3 sm:px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all flex items-center space-x-1 border-2 border-indigo-200 hover:border-indigo-400 font-medium transform hover:scale-105 text-sm sm:text-base"
                        >
                          <DocumentArrowDownIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Invoice</span>
                        </button>
                        {fee.status !== 'paid' && (
                          <Link
                            to={`/fees/${fee.id}/pay`}
                            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center space-x-1 shadow-md hover:shadow-lg font-medium transform hover:scale-105 text-sm sm:text-base"
                          >
                            <CreditCardIcon className="w-4 h-4 sm:w-5 sm:h-5" />
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