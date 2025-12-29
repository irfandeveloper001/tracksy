// IndexTable Usage Example
// Complete example showing all features

import { useState, useCallback } from 'react';
import {
  IndexTable,
  IndexTableCell,
  IndexFilters,
  Badge,
  ChoiceList,
  RangeSlider,
  useIndexFilters,
  useIndexResourceState,
} from './index';
import type { Tab, SortOption, Filter, AppliedFilter, PrimaryAction } from './types';
import Card from '../../ui/Card';
import Input from '../../ui/Input';

// Sample data interface
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: string;
  total: string;
  paymentStatus: 'paid' | 'partially-paid' | 'unpaid';
  fulfillmentStatus: 'fulfilled' | 'unfulfilled' | 'partial';
}

export default function IndexTableExample() {
  // Helper function
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Tab/View Management
  const [itemStrings, setItemStrings] = useState([
    'All',
    'Unpaid',
    'Open',
    'Closed',
    'Local delivery',
    'Local pickup',
  ]);
  const [selected, setSelected] = useState(0);

  const deleteView = (index: number) => {
    const newItemStrings = [...itemStrings];
    newItemStrings.splice(index, 1);
    setItemStrings(newItemStrings);
    setSelected(0);
  };

  const duplicateView = async (name: string) => {
    setItemStrings([...itemStrings, name]);
    setSelected(itemStrings.length);
    await sleep(1);
    return true;
  };

  const tabs: Tab[] = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions:
      index === 0
        ? []
        : [
            {
              type: 'rename',
              onAction: () => {},
              onPrimaryAction: async (value: string): Promise<boolean> => {
                const newItemsStrings = tabs.map((item, idx) => {
                  if (idx === index) {
                    return value;
                  }
                  return item.content;
                });
                await sleep(1);
                setItemStrings(newItemsStrings);
                return true;
              },
            },
            {
              type: 'duplicate',
              onPrimaryAction: async (value: string): Promise<boolean> => {
                await sleep(1);
                duplicateView(value);
                return true;
              },
            },
            {
              type: 'edit',
            },
            {
              type: 'delete',
              onPrimaryAction: async () => {
                await sleep(1);
                deleteView(index);
                return true;
              },
            },
          ],
  }));

  const onCreateNewView = async (value: string) => {
    await sleep(500);
    setItemStrings([...itemStrings, value]);
    setSelected(itemStrings.length);
    return true;
  };

  // Sorting
  const sortOptions: SortOption[] = [
    { label: 'Order', value: 'order asc', directionLabel: 'Ascending' },
    { label: 'Order', value: 'order desc', directionLabel: 'Descending' },
    { label: 'Customer', value: 'customer asc', directionLabel: 'A-Z' },
    { label: 'Customer', value: 'customer desc', directionLabel: 'Z-A' },
    { label: 'Date', value: 'date asc', directionLabel: 'A-Z' },
    { label: 'Date', value: 'date desc', directionLabel: 'Z-A' },
    { label: 'Total', value: 'total asc', directionLabel: 'Ascending' },
    { label: 'Total', value: 'total desc', directionLabel: 'Descending' },
  ];
  const [sortSelected, setSortSelected] = useState(['order asc']);

  // Filters Mode
  const { mode, setMode } = useIndexFilters();

  // Primary Action
  const onHandleSave = async () => {
    await sleep(1);
    return true;
  };

  const primaryAction: PrimaryAction =
    selected === 0
      ? {
          type: 'save-as',
          onAction: onCreateNewView,
          disabled: false,
          loading: false,
        }
      : {
          type: 'save',
          onAction: onHandleSave,
          disabled: false,
          loading: false,
        };

  // Filter States
  const [accountStatus, setAccountStatus] = useState<string[] | undefined>(undefined);
  const [moneySpent, setMoneySpent] = useState<[number, number] | undefined>(undefined);
  const [taggedWith, setTaggedWith] = useState('');
  const [queryValue, setQueryValue] = useState('');

  const handleAccountStatusChange = useCallback((value: string[]) => setAccountStatus(value), []);
  const handleMoneySpentChange = useCallback((value: [number, number]) => setMoneySpent(value), []);
  const handleTaggedWithChange = useCallback((value: string) => setTaggedWith(value), []);
  const handleFiltersQueryChange = useCallback((value: string) => setQueryValue(value), []);
  const handleAccountStatusRemove = useCallback(() => setAccountStatus(undefined), []);
  const handleMoneySpentRemove = useCallback(() => setMoneySpent(undefined), []);
  const handleTaggedWithRemove = useCallback(() => setTaggedWith(''), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
  const handleFiltersClearAll = useCallback(() => {
    handleAccountStatusRemove();
    handleMoneySpentRemove();
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [
    handleAccountStatusRemove,
    handleMoneySpentRemove,
    handleQueryValueRemove,
    handleTaggedWithRemove,
  ]);

  // Filter Definitions
  const filters: Filter[] = [
    {
      key: 'accountStatus',
      label: 'Account status',
      filter: (
        <ChoiceList
          title="Account status"
          titleHidden
          choices={[
            { label: 'Enabled', value: 'enabled' },
            { label: 'Not invited', value: 'not invited' },
            { label: 'Invited', value: 'invited' },
            { label: 'Declined', value: 'declined' },
          ]}
          selected={accountStatus || []}
          onChange={handleAccountStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'taggedWith',
      label: 'Tagged with',
      filter: (
        <Input
          label="Tagged with"
          value={taggedWith}
          onChange={(e) => handleTaggedWithChange(e.target.value)}
          className="labelHidden"
        />
      ),
      shortcut: true,
    },
    {
      key: 'moneySpent',
      label: 'Money spent',
      filter: (
        <RangeSlider
          label="Money spent is between"
          labelHidden
          value={moneySpent || [0, 500]}
          prefix="$"
          output
          min={0}
          max={2000}
          step={1}
          onChange={handleMoneySpentChange}
        />
      ),
    },
  ];

  // Applied Filters
  const appliedFilters: AppliedFilter[] = [];
  if (accountStatus && accountStatus.length > 0) {
    appliedFilters.push({
      key: 'accountStatus',
      label: accountStatus.map((val) => `Customer ${val}`).join(', '),
      onRemove: handleAccountStatusRemove,
    });
  }
  if (moneySpent) {
    appliedFilters.push({
      key: 'moneySpent',
      label: `Money spent is between $${moneySpent[0]} and $${moneySpent[1]}`,
      onRemove: handleMoneySpentRemove,
    });
  }
  if (taggedWith) {
    appliedFilters.push({
      key: 'taggedWith',
      label: `Tagged with ${taggedWith}`,
      onRemove: handleTaggedWithRemove,
    });
  }

  // Sample Data
  const orders: Order[] = [
    {
      id: '1020',
      orderNumber: '#1020',
      date: 'Jul 20 at 4:34pm',
      customer: 'Jaydon Stanton',
      total: '$969.44',
      paymentStatus: 'paid',
      fulfillmentStatus: 'unfulfilled',
    },
    {
      id: '1019',
      orderNumber: '#1019',
      date: 'Jul 20 at 3:46pm',
      customer: 'Ruben Westerfelt',
      total: '$701.19',
      paymentStatus: 'partially-paid',
      fulfillmentStatus: 'unfulfilled',
    },
    {
      id: '1018',
      orderNumber: '#1018',
      date: 'Jul 20 at 3:44pm',
      customer: 'Leo Carder',
      total: '$798.24',
      paymentStatus: 'paid',
      fulfillmentStatus: 'unfulfilled',
    },
  ];

  // Resource Management
  const resourceName = {
    singular: 'order',
    plural: 'orders',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(orders, (order) => order.id);

  // Badge mapping
  const getPaymentBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return <Badge progress="complete">Paid</Badge>;
      case 'partially-paid':
        return <Badge progress="partiallyComplete">Partially paid</Badge>;
      case 'unpaid':
        return <Badge progress="incomplete">Unpaid</Badge>;
    }
  };

  const getFulfillmentBadge = (status: Order['fulfillmentStatus']) => {
    switch (status) {
      case 'fulfilled':
        return <Badge progress="complete">Fulfilled</Badge>;
      case 'partial':
        return <Badge progress="partiallyComplete">Partial</Badge>;
      case 'unfulfilled':
        return <Badge progress="incomplete">Unfulfilled</Badge>;
    }
  };

  // Table Columns
  const columns = [
    { title: 'Order', sortable: true },
    { title: 'Date', sortable: true },
    { title: 'Customer', sortable: true },
    { title: 'Total', alignment: 'end' as const, sortable: true },
    { title: 'Payment status' },
    { title: 'Fulfillment status' },
  ];

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Filters */}
      <IndexFilters
        sortOptions={sortOptions}
        sortSelected={sortSelected}
        queryValue={queryValue}
        queryPlaceholder="Searching in all"
        onQueryChange={handleFiltersQueryChange}
        onQueryClear={() => setQueryValue('')}
        onSort={setSortSelected}
        primaryAction={primaryAction}
        cancelAction={{
          onAction: () => {},
          disabled: false,
          loading: false,
        }}
        tabs={tabs}
        selected={selected}
        onSelect={setSelected}
        canCreateNewView
        onCreateNewView={onCreateNewView}
        filters={filters}
        appliedFilters={appliedFilters}
        onClearAll={handleFiltersClearAll}
        mode={mode}
        setMode={setMode}
      />

      {/* Table */}
      <IndexTable
        columns={columns}
        data={orders}
        resourceName={resourceName}
        selectedItems={selectedResources}
        onSelectionChange={handleSelectionChange}
        getItemId={(order) => order.id}
        renderRow={(order, index, isSelected) => (
          <>
            <IndexTableCell>
              <span className="font-semibold">{order.orderNumber}</span>
            </IndexTableCell>
            <IndexTableCell>{order.date}</IndexTableCell>
            <IndexTableCell>{order.customer}</IndexTableCell>
            <IndexTableCell alignment="end">
              <span className="font-medium">{order.total}</span>
            </IndexTableCell>
            <IndexTableCell>{getPaymentBadge(order.paymentStatus)}</IndexTableCell>
            <IndexTableCell>{getFulfillmentBadge(order.fulfillmentStatus)}</IndexTableCell>
          </>
        )}
      />
    </Card>
  );
}

