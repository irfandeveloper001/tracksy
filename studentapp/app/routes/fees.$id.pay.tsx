import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import DashboardLayout from "../components/layout/DashboardLayout";
import feeService from "../lib/api/feeService";
import authService from "../lib/api/authService";
import toast from "react-hot-toast";
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  icon: any;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "cash",
    code: "cash",
    name: "Cash Payment",
    icon: BanknotesIcon,
    description: "Pay with cash at the office",
  },
  {
    id: "card",
    code: "card",
    name: "Debit/Credit Card",
    icon: CreditCardIcon,
    description: "Pay with your card",
  },
  {
    id: "online",
    code: "online",
    name: "Online Banking",
    icon: ComputerDesktopIcon,
    description: "Pay via online banking",
  },
];

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [fee, setFee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [userData, feeData] = await Promise.all([
        authService.me(),
        feeService.getFee(Number(id)),
      ]);
      setUser(userData);
      setFee(feeData);
      // Set default amount to remaining balance
      if (feeData) {
        setAmount(feeData.remaining_balance?.toString() || feeData.amount?.toString() || "");
      }
    } catch (error: any) {
      console.error("Failed to load fee data:", error);
      toast.error("Failed to load fee details");
      navigate("/fees");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (paymentAmount > parseFloat(fee.remaining_balance || fee.amount)) {
      toast.error("Payment amount cannot exceed the remaining balance");
      return;
    }

    setProcessing(true);

    try {
      const result = await feeService.makePayment(Number(id), {
        amount: paymentAmount,
        payment_method: selectedMethod,
        notes: notes.trim() || undefined,
      });

      toast.success("Payment processed successfully!");
      
      // Redirect to fees page after a short delay
      setTimeout(() => {
        navigate("/fees");
      }, 1500);
    } catch (error: any) {
      console.error("Payment error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Payment failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!fee) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Fee not found</p>
            <Link
              to="/fees"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Fees
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const remainingBalance = parseFloat(fee.remaining_balance || fee.amount || 0);
  const maxAmount = remainingBalance;

  return (
    <DashboardLayout user={user}>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to="/fees"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Make Payment
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Complete your fee payment
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fee Details Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Fee Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Fee Type</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {fee.fee_type
                      ? fee.fee_type.charAt(0).toUpperCase() + fee.fee_type.slice(1)
                      : "N/A"}{" "}
                    Fee
                  </p>
                </div>
                {fee.description && (
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-sm text-gray-900 mt-1">{fee.description}</p>
                  </div>
                )}
                {fee.semester && (
                  <div>
                    <p className="text-sm text-gray-600">Semester</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {fee.semester}
                    </p>
                  </div>
                )}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${parseFloat(fee.amount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Paid</span>
                    <span className="text-sm font-medium text-green-600">
                      ${parseFloat(fee.total_paid || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-base font-semibold text-gray-900">
                      Balance Due
                    </span>
                    <span className="text-xl font-bold text-red-600">
                      ${remainingBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
                {fee.due_date && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        Due:{" "}
                        {new Date(fee.due_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      fee.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : fee.status === "overdue"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {fee.status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Payment Method Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Select Payment Method
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.code;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.code)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 mx-auto mb-2 ${
                            isSelected ? "text-indigo-600" : "text-gray-400"
                          }`}
                        />
                        <p
                          className={`text-sm font-semibold mb-1 ${
                            isSelected ? "text-indigo-900" : "text-gray-900"
                          }`}
                        >
                          {method.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {method.description}
                        </p>
                        {isSelected && (
                          <div className="mt-2 flex justify-center">
                            <CheckCircleIcon className="w-5 h-5 text-indigo-600" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Amount */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Payment Amount
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (PKR)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={maxAmount}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Maximum amount: ${maxAmount.toFixed(2)}
                    </p>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAmount((maxAmount * 0.25).toFixed(2))}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount((maxAmount * 0.5).toFixed(2))}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount((maxAmount * 0.75).toFixed(2))}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount(maxAmount.toFixed(2))}
                      className="px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                      Full Amount
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Additional Information
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    placeholder="Add any additional notes or reference information..."
                  />
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 border-2 border-indigo-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Payment Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Payment Method</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedMethod
                        ? paymentMethods.find((m) => m.code === selectedMethod)
                            ?.name || selectedMethod
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Amount to Pay</span>
                    <span className="text-lg font-bold text-indigo-600">
                      ${amount ? parseFloat(amount).toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-indigo-200">
                    <span className="text-base font-semibold text-gray-900">
                      Remaining Balance
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      $
                      {amount
                        ? (remainingBalance - parseFloat(amount)).toFixed(2)
                        : remainingBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/fees"
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={processing || !selectedMethod || !amount || parseFloat(amount) <= 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="w-5 h-5" />
                      <span>Pay Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

