import { useState, useEffect } from 'react';
import feeService from '../../lib/api/feeService';
import { InvoicesTable } from '~/components/fees';
import type { Invoice } from '~/components/fees';
import Card from '~/components/ui/Card';
import toast from 'react-hot-toast';
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

export default function InvoiceGeneratorPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const feesData = await feeService.getFees({});
      const allFees = feesData.data || feesData;
      
      // Filter only transport fees
      const transportFees = allFees.filter((f: any) => f.fee_type === 'transport');
      
      console.log('📊 Loaded transport fees:', transportFees);
      
      setFees(transportFees);
    } catch (error: any) {
      console.error('❌ Failed to load data:', error);
      toast.error(error.message || 'Failed to load fees data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (id: string) => {
    try {
      const loadingToast = toast.loading('Generating invoice...');
      await feeService.generateInvoice(parseInt(id));
      toast.dismiss(loadingToast);
      toast.success('✅ Invoice generated and sent to student!', {
        duration: 4000,
        icon: '📧',
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: '500',
        },
      });
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate invoice', {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      console.error('❌ Invoice generation error:', error);
    }
  };

  const handleDeleteFee = async (id: string) => {
    try {
      await feeService.deleteFee(parseInt(id));
      
      toast.success('🗑️ Invoice deleted successfully!', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: '500',
        },
      });
      
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete invoice', {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    }
  };

  const handleBulkSend = async (ids: string[]) => {
    try {
      const loadingToast = toast.loading(`Generating ${ids.length} invoice(s)...`);
      
      const result = await feeService.generateBulkInvoices(ids.map((id) => parseInt(id)));
      
      toast.dismiss(loadingToast);
      
      const successCount = result.success_count || ids.length;
      const failedCount = result.failed_count || 0;
      
      if (failedCount > 0) {
        toast.error(
          `⚠️ ${successCount} invoice(s) sent, ${failedCount} failed`,
          { 
            duration: 6000,
            style: {
              background: '#f59e0b',
              color: '#fff',
              fontWeight: '500',
            },
          }
        );
        
        if (result.errors && result.errors.length > 0) {
          console.error('Failed invoices:', result.errors);
        }
      } else {
        toast.success(
          `🎉 ${successCount} invoice(s) sent successfully!`,
          {
            duration: 5000,
            icon: '📧',
            style: {
              background: '#10b981',
              color: '#fff',
              fontWeight: '500',
            },
          }
        );
      }
      
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate invoices', {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      console.error('❌ Bulk invoice generation error:', error);
    }
  };

  // Transform fees data to invoice format
  const invoices: Invoice[] = fees.map((fee) => ({
    id: fee.id.toString(),
    studentName: fee.user?.name || 'Unknown',
    studentEmail: fee.user?.email || '',
    semester: fee.semester,
    feeType: fee.fee_type,
    amount: parseFloat(fee.amount),
    remainingBalance: parseFloat(fee.remaining_balance),
    dueDate: fee.due_date,
    status: fee.status,
  }));

  // Calculate statistics
  const statistics = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter((inv) => inv.status === 'paid').length,
    paidAmount: invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter((inv) => inv.status === 'pending').length,
    pendingAmount: invoices
      .filter((inv) => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.remainingBalance, 0),
    overdue: invoices.filter((inv) => inv.status === 'overdue').length,
    overdueAmount: invoices
      .filter((inv) => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.remainingBalance, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading transport invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Total Transport Invoices</p>
                <p className="text-4xl font-bold mt-2">{statistics.total}</p>
                <p className="text-sm text-blue-100 mt-1">
                  ${statistics.totalAmount.toFixed(2)} total
                </p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <TruckIcon className="w-10 h-10" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">Paid</p>
                <p className="text-4xl font-bold mt-2">{statistics.paid}</p>
                <p className="text-sm text-green-100 mt-1">
                  ${statistics.paidAmount.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <CheckCircleIcon className="w-10 h-10" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-100">Pending</p>
                <p className="text-4xl font-bold mt-2">{statistics.pending}</p>
                <p className="text-sm text-yellow-100 mt-1">
                  ${statistics.pendingAmount.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <ClockIcon className="w-10 h-10" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-100">Overdue</p>
                <p className="text-4xl font-bold mt-2">{statistics.overdue}</p>
                <p className="text-sm text-red-100 mt-1">
                  ${statistics.overdueAmount.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <ExclamationTriangleIcon className="w-10 h-10" />
              </div>
            </div>
          </Card>
        </div>

        {/* Invoices Table */}
        <InvoicesTable
          initialData={invoices}
          onSendInvoice={handleGenerateInvoice}
          onDeleteInvoice={handleDeleteFee}
          onBulkSend={handleBulkSend}
        />
      </div>
    </div>
  );
}
