// Transport Fee Invoices Table
// Professional invoice table with filtering, sorting, and bulk actions

import { useState, useCallback, useEffect } from 'react';
import {
  IndexTable,
  IndexTableCell,
  IndexFilters,
  Badge,
  ChoiceList,
  useIndexFilters,
  useIndexResourceState,
} from '../tables/IndexTable';
import type { Tab, SortOption, Filter, AppliedFilter } from '../tables/IndexTable/types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import { EnvelopeIcon, TrashIcon } from '@heroicons/react/24/outline';

// Invoice Data Interface
export interface Invoice {
  id: string;
  studentName: string;
  studentEmail: string;
  semester: string;
  feeType: string;
  amount: number;
  remainingBalance: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
}

interface InvoicesTableProps {
  initialData?: Invoice[];
  onSendInvoice?: (id: string) => void;
  onDeleteInvoice?: (id: string) => void;
  onBulkSend?: (ids: string[]) => void;
}

export default function InvoicesTable({
  initialData = [],
  onSendInvoice,
  onDeleteInvoice,
  onBulkSend,
}: InvoicesTableProps) {
  // Data State
  const [invoices, setInvoices] = useState<Invoice[]>(initialData);
  const [filteredData, setFilteredData] = useState<Invoice[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Send Confirmation Modal State
  const [isBulkSendModalOpen, setIsBulkSendModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Search & Query
  const [queryValue, setQueryValue] = useState('');

  // Sorting
  const sortOptions: SortOption[] = [
    { label: 'Student', value: 'student_asc', directionLabel: 'A-Z' },
    { label: 'Student', value: 'student_desc', directionLabel: 'Z-A' },
    { label: 'Amount', value: 'amount_asc', directionLabel: 'Low to High' },
    { label: 'Amount', value: 'amount_desc', directionLabel: 'High to Low' },
    { label: 'Due Date', value: 'date_asc', directionLabel: 'Earliest First' },
    { label: 'Due Date', value: 'date_desc', directionLabel: 'Latest First' },
  ];
  const [sortSelected, setSortSelected] = useState(['date_asc']);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [semesterFilter, setSemesterFilter] = useState<string[]>([]);
  const [feeTypeFilter, setFeeTypeFilter] = useState<string[]>([]);

  const handleFiltersClearAll = useCallback(() => {
    setStatusFilter([]);
    setSemesterFilter([]);
    setFeeTypeFilter([]);
    setQueryValue('');
  }, []);

  // Get unique semesters and fee types from data
  const uniqueSemesters = Array.from(new Set(initialData.map((inv) => inv.semester)));
  const uniqueFeeTypes = Array.from(new Set(initialData.map((inv) => inv.feeType)));

  const filters: Filter[] = [
    {
      key: 'status',
      label: 'Status',
      filter: (
        <ChoiceList
          title="Status"
          titleHidden
          choices={[
            { label: 'Pending', value: 'pending' },
            { label: 'Paid', value: 'paid' },
            { label: 'Overdue', value: 'overdue' },
          ]}
          selected={statusFilter}
          onChange={setStatusFilter}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'semester',
      label: 'Semester',
      filter: (
        <ChoiceList
          title="Semester"
          titleHidden
          choices={uniqueSemesters.map((sem) => ({ label: sem, value: sem }))}
          selected={semesterFilter}
          onChange={setSemesterFilter}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'feeType',
      label: 'Fee Type',
      filter: (
        <ChoiceList
          title="Fee Type"
          titleHidden
          choices={uniqueFeeTypes.map((type) => ({
            label: type.replace('_', ' ').toUpperCase(),
            value: type,
          }))}
          selected={feeTypeFilter}
          onChange={setFeeTypeFilter}
          allowMultiple
        />
      ),
    },
  ];

  const appliedFilters: AppliedFilter[] = [];
  if (statusFilter.length > 0) {
    appliedFilters.push({
      key: 'status',
      label: `Status: ${statusFilter.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}`,
      onRemove: () => setStatusFilter([]),
    });
  }
  if (semesterFilter.length > 0) {
    appliedFilters.push({
      key: 'semester',
      label: `Semester: ${semesterFilter.join(', ')}`,
      onRemove: () => setSemesterFilter([]),
    });
  }
  if (feeTypeFilter.length > 0) {
    appliedFilters.push({
      key: 'feeType',
      label: `Fee Type: ${feeTypeFilter.map((t) => t.replace('_', ' ')).join(', ')}`,
      onRemove: () => setFeeTypeFilter([]),
    });
  }

  // Tabs/Views
  const [tabs] = useState<Tab[]>([
    {
      id: 'all',
      content: 'All',
      index: 0,
      isLocked: true,
    },
    {
      id: 'pending',
      content: 'Pending',
      index: 1,
      isLocked: true,
    },
    {
      id: 'paid',
      content: 'Paid',
      index: 2,
      isLocked: true,
    },
    {
      id: 'overdue',
      content: 'Overdue',
      index: 3,
      isLocked: true,
    },
  ]);
  const [selectedTab, setSelectedTab] = useState(0);

  // Hooks
  const { mode, setMode } = useIndexFilters();
  const { selectedResources, handleSelectionChange, clearSelection } = useIndexResourceState(
    filteredData,
    (item) => item.id
  );

  // Resource Name
  const resourceName = {
    singular: 'invoice',
    plural: 'invoices',
  };

  // Table Columns (removed View column)
  const columns = [
    { title: 'Student', sortable: true },
    { title: 'Semester', sortable: true },
    { title: 'Fee Type' },
    { title: 'Amount', alignment: 'end' as const, sortable: true },
    { title: 'Due Date', sortable: true },
    { title: 'Status' },
    { title: 'Actions', alignment: 'end' as const },
  ];

  // Filter and Sort Data
  useEffect(() => {
    let result = [...invoices];

    // Apply tab filter
    if (selectedTab > 0) {
      const tabStatus = tabs[selectedTab].id;
      result = result.filter((inv) => inv.status === tabStatus);
    }

    // Apply search filter
    if (queryValue) {
      const query = queryValue.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.studentName.toLowerCase().includes(query) ||
          inv.studentEmail.toLowerCase().includes(query) ||
          inv.semester.toLowerCase().includes(query) ||
          inv.feeType.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter((inv) => statusFilter.includes(inv.status));
    }

    // Apply semester filter
    if (semesterFilter.length > 0) {
      result = result.filter((inv) => semesterFilter.includes(inv.semester));
    }

    // Apply fee type filter
    if (feeTypeFilter.length > 0) {
      result = result.filter((inv) => feeTypeFilter.includes(inv.feeType));
    }

    // Apply sorting
    const [sortValue] = sortSelected;
    if (sortValue) {
      result.sort((a, b) => {
        switch (sortValue) {
          case 'student_asc':
            return a.studentName.localeCompare(b.studentName);
          case 'student_desc':
            return b.studentName.localeCompare(a.studentName);
          case 'amount_asc':
            return a.amount - b.amount;
          case 'amount_desc':
            return b.amount - a.amount;
          case 'date_asc':
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          case 'date_desc':
            return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
          default:
            return 0;
        }
      });
    }

    setFilteredData(result);
  }, [invoices, queryValue, statusFilter, semesterFilter, feeTypeFilter, sortSelected, selectedTab, tabs]);

  // Update data when initialData changes
  useEffect(() => {
    setInvoices(initialData);
  }, [initialData]);

  // Handle Delete Click
  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!invoiceToDelete || !onDeleteInvoice) return;

    setIsDeleting(true);
    try {
      await onDeleteInvoice(invoiceToDelete.id);
      setIsDeleteModalOpen(false);
      setInvoiceToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Send Click
  const handleBulkSendClick = () => {
    setIsBulkSendModalOpen(true);
  };

  // Confirm Bulk Send
  const handleConfirmBulkSend = async () => {
    if (!onBulkSend) return;

    setIsSending(true);
    try {
      await onBulkSend(selectedResources);
      setIsBulkSendModalOpen(false);
      clearSelection();
    } catch (error) {
      console.error('Bulk send error:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Get badge progress based on status
  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <Badge progress="complete">Paid</Badge>;
      case 'pending':
        return <Badge progress="partiallyComplete">Pending</Badge>;
      case 'overdue':
        return <Badge progress="incomplete">Overdue</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedResources.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-900">
              {selectedResources.length} {selectedResources.length === 1 ? 'invoice' : 'invoices'}{' '}
              selected
            </span>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleBulkSendClick}>
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                Send Selected Invoices
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <Card padding="none" className="overflow-hidden shadow-lg border-0">
        <IndexFilters
          sortOptions={sortOptions}
          sortSelected={sortSelected}
          queryValue={queryValue}
          queryPlaceholder="Search by student name, email, semester..."
          onQueryChange={setQueryValue}
          onQueryClear={() => setQueryValue('')}
          onSort={setSortSelected}
          tabs={tabs}
          selected={selectedTab}
          onSelect={setSelectedTab}
          filters={filters}
          appliedFilters={appliedFilters}
          onClearAll={handleFiltersClearAll}
          mode={mode}
          setMode={setMode}
        />

        <IndexTable
          columns={columns}
          data={filteredData}
          resourceName={resourceName}
          selectedItems={selectedResources}
          onSelectionChange={handleSelectionChange}
          getItemId={(item) => item.id}
          loading={isLoading}
          emptyState={
            <div className="text-center py-16">
              <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
                <svg
                  className="w-16 h-16 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">
                {queryValue || appliedFilters.length > 0
                  ? 'No invoices match your filters'
                  : 'No invoices found'}
              </p>
              {(queryValue || appliedFilters.length > 0) && (
                <Button variant="secondary" size="sm" onClick={handleFiltersClearAll}>
                  Clear Filters
                </Button>
              )}
            </div>
          }
          renderRow={(invoice, index, isSelected) => (
            <>
              <IndexTableCell>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">
                      {invoice.studentName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{invoice.studentName}</p>
                    <p className="text-sm text-gray-500">{invoice.studentEmail}</p>
                  </div>
                </div>
              </IndexTableCell>
              <IndexTableCell>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  {invoice.semester}
                </span>
              </IndexTableCell>
              <IndexTableCell>
                <span className="text-gray-900 font-medium capitalize">
                  {invoice.feeType.replace('_', ' ')}
                </span>
              </IndexTableCell>
              <IndexTableCell alignment="end">
                <span className="text-lg font-bold text-gray-900">
                  ${invoice.amount.toFixed(2)}
                </span>
              </IndexTableCell>
              <IndexTableCell>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </IndexTableCell>
              <IndexTableCell>{getStatusBadge(invoice.status)}</IndexTableCell>
              <IndexTableCell alignment="end">
                <div className="flex items-center justify-end gap-2">
                  {onSendInvoice && invoice.status !== 'paid' && (
                    <button
                      onClick={() => onSendInvoice(invoice.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Send Invoice"
                    >
                      <EnvelopeIcon className="w-5 h-5" />
                    </button>
                  )}
                  {onDeleteInvoice && (
                    <button
                      onClick={() => handleDeleteClick(invoice)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </IndexTableCell>
            </>
          )}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setInvoiceToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Invoice"
        message={`Are you sure you want to delete the invoice for ${invoiceToDelete?.studentName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />

      {/* Bulk Send Confirmation Modal */}
      <ConfirmModal
        isOpen={isBulkSendModalOpen}
        onClose={() => setIsBulkSendModalOpen(false)}
        onConfirm={handleConfirmBulkSend}
        title="Send Invoices"
        message={`Send ${selectedResources.length} invoice(s) to students? They will receive email notifications with invoice details and payment instructions.`}
        confirmText="Send Invoices"
        cancelText="Cancel"
        type="info"
        isLoading={isSending}
      />
    </div>
  );
}
