// IndexTable Template
// Copy and customize this template for your own tables

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

// 1️⃣ DEFINE YOUR DATA INTERFACE
interface YourDataType {
  id: string;
  // Add your fields here
  name: string;
  status: string;
  // ... more fields
}

export default function YourTableComponent() {
  // 2️⃣ SETUP YOUR DATA
  const [data, setData] = useState<YourDataType[]>([
    // Your data here
  ]);

  // 3️⃣ SEARCH & QUERY
  const [queryValue, setQueryValue] = useState('');

  // 4️⃣ SORTING
  const sortOptions: SortOption[] = [
    { label: 'Name', value: 'name asc', directionLabel: 'A-Z' },
    { label: 'Name', value: 'name desc', directionLabel: 'Z-A' },
    // Add more sort options
  ];
  const [sortSelected, setSortSelected] = useState(['name asc']);

  // 5️⃣ FILTERS
  const [filterOne, setFilterOne] = useState<string[]>([]);
  const [filterTwo, setFilterTwo] = useState('');

  const handleFiltersClearAll = useCallback(() => {
    setFilterOne([]);
    setFilterTwo('');
    setQueryValue('');
  }, []);

  const filters: Filter[] = [
    {
      key: 'filterOne',
      label: 'Filter One',
      filter: (
        <ChoiceList
          title="Filter One"
          titleHidden
          choices={[
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
          ]}
          selected={filterOne}
          onChange={setFilterOne}
          allowMultiple
        />
      ),
    },
    {
      key: 'filterTwo',
      label: 'Filter Two',
      filter: (
        <Input
          label="Filter Two"
          value={filterTwo}
          onChange={(e) => setFilterTwo(e.target.value)}
        />
      ),
    },
  ];

  const appliedFilters: AppliedFilter[] = [];
  if (filterOne.length > 0) {
    appliedFilters.push({
      key: 'filterOne',
      label: `Filter One: ${filterOne.join(', ')}`,
      onRemove: () => setFilterOne([]),
    });
  }
  if (filterTwo) {
    appliedFilters.push({
      key: 'filterTwo',
      label: `Filter Two: ${filterTwo}`,
      onRemove: () => setFilterTwo(''),
    });
  }

  // 6️⃣ TABS/VIEWS (Optional - remove if not needed)
  const [tabs] = useState<Tab[]>([
    {
      id: 'all',
      content: 'All',
      index: 0,
      isLocked: true,
    },
  ]);
  const [selectedTab, setSelectedTab] = useState(0);

  // 7️⃣ HOOKS
  const { mode, setMode } = useIndexFilters();
  const { selectedResources, handleSelectionChange } = useIndexResourceState(
    data,
    (item) => item.id
  );

  // 8️⃣ RESOURCE NAME
  const resourceName = {
    singular: 'item', // Change this
    plural: 'items', // Change this
  };

  // 9️⃣ TABLE COLUMNS
  const columns = [
    { title: 'Name', sortable: true },
    { title: 'Status' },
    // Add more columns
  ];

  // 🔟 RENDER
  return (
    <Card padding="none" className="overflow-hidden">
      {/* Filters - Remove if you don't need filters */}
      <IndexFilters
        sortOptions={sortOptions}
        sortSelected={sortSelected}
        queryValue={queryValue}
        queryPlaceholder="Search..."
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

      {/* Table */}
      <IndexTable
        columns={columns}
        data={data}
        resourceName={resourceName}
        selectedItems={selectedResources}
        onSelectionChange={handleSelectionChange}
        getItemId={(item) => item.id}
        renderRow={(item, index, isSelected) => (
          <>
            <IndexTableCell>
              <span className="font-semibold">{item.name}</span>
            </IndexTableCell>
            <IndexTableCell>
              <Badge progress="complete">{item.status}</Badge>
            </IndexTableCell>
            {/* Add more cells */}
          </>
        )}
      />
    </Card>
  );
}

/* 
📝 QUICK CUSTOMIZATION CHECKLIST:

□ Update YourDataType interface with your fields
□ Replace YourTableComponent with your component name
□ Update resourceName (singular/plural)
□ Define your columns
□ Add your data source
□ Customize sort options
□ Setup your filters
□ Implement renderRow with your cells
□ Add Badge components for status fields
□ Remove tabs if not needed
□ Remove filters if not needed
□ Add loading state if fetching data
□ Add empty state if needed

💡 TIPS:

- Use Badge with progress="complete|partiallyComplete|incomplete"
- Use alignment="end" for numeric columns (prices, totals)
- Use font-semibold for important text (IDs, names)
- Keep filters simple - only add what users need
- Lock the first tab if it shows all items
- Use ChoiceList for multi-select filters
- Use RangeSlider for numeric range filters
- Use Input for text search filters
*/

