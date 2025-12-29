import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import feeService, { type Fee } from '../../lib/api/feeService';
import { InvoicesTable } from '~/components/fees';
import type { Invoice } from '~/components/fees';
import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import {
  BanknotesIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export default function FeesPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    semester: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [filters, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feesData, statsData] = await Promise.all([
        feeService.getFees({
          status: filters.status || undefined,
          semester: filters.semester || undefined,
          page: currentPage,
        }),
        feeService.getStatistics(),
      ]);

      setFees(feesData.data || feesData);
      setStatistics(statsData);
    } catch (error: any) {
      console.error('Failed to load fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOverdue = async () => {
    if (!confirm('Update all overdue fees now? This will send notifications to students.'))
      return;

    try {
      await feeService.updateOverdueFees();
      alert('Overdue fees updated successfully!');
      loadData();
    } catch (error) {
      alert('Failed to update overdue fees');
    }
  };

  const handleGenerateInvoice = async (id: string) => {
    try {
      await feeService.generateInvoice(parseInt(id));
      alert('Invoice sent to student successfully!');
    } catch (error) {
      alert('Failed to send invoice');
    }
  };

  const handleViewInvoice = (id: string) => {
    window.location.href = `/fees/${id}`;
  };

  const handleDeleteFee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee?')) return;

    try {
      await feeService.deleteFee(parseInt(id));
      alert('Fee deleted successfully!');
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete fee');
    }
  };

  const handleBulkSend = async (ids: string[]) => {
    if (!confirm(`Send invoices to ${ids.length} students?`)) return;

    try {
      await feeService.generateBulkInvoices(ids.map((id) => parseInt(id)));
      alert(`Invoices sent to ${ids.length} students successfully!`);
    } catch (error) {
      alert('Failed to send bulk invoices');
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

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading fees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transport Invoices</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{statistics.total_students || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ${parseFloat(statistics.total_fees || 0).toFixed(2)} total
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BanknotesIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {statistics.paid_count || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ${parseFloat(statistics.total_paid || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {statistics.students_with_pending_fees || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ${parseFloat(statistics.pending_amount || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ClockIcon className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {statistics.overdue_count || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ${parseFloat(statistics.overdue_amount || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transport Fee Invoices</h1>
            <p className="text-sm text-gray-600 mt-1">
              {invoices.length} total invoices
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/fees/reports">
              <Button variant="secondary">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Reports
              </Button>
            </Link>
            <Button variant="warning" onClick={handleUpdateOverdue}>
              <ClockIcon className="w-5 h-5 mr-2" />
              Update Overdue
            </Button>
            <Link to="/fees/new">
              <Button variant="primary">
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Fee
              </Button>
            </Link>
          </div>
        </div>

        {/* Invoices Table */}
        <InvoicesTable
          initialData={invoices}
          onSendInvoice={handleGenerateInvoice}
          onViewInvoice={handleViewInvoice}
          onDeleteInvoice={handleDeleteFee}
          onBulkSend={handleBulkSend}
        />
      </div>
    </div>
  );
}
