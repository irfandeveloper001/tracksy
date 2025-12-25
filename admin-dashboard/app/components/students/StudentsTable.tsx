// Students Table Component
// Complete table with filtering, sorting, search, and selection

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
import Input from '../ui/Input';
import Button from '../ui/Button';

// Student Data Interface
export interface Student {
  id: string;
  studentId: string;
  name: string;
  grade: string;
  status: 'active' | 'inactive';
  busRoute: string;
  parentName: string;
  parentPhone: string;
  address: string;
  joinDate: string;
}

interface StudentsTableProps {
  initialData?: Student[];
  onBulkAction?: (selectedIds: string[], action: string) => void;
}

export default function StudentsTable({ 
  initialData = [], 
  onBulkAction 
}: StudentsTableProps) {
  // Data State
  const [students, setStudents] = useState<Student[]>(initialData);
  const [filteredData, setFilteredData] = useState<Student[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Query
  const [queryValue, setQueryValue] = useState('');

  // Sorting
  const sortOptions: SortOption[] = [
    { label: 'Student ID', value: 'id_asc', directionLabel: 'Ascending' },
    { label: 'Student ID', value: 'id_desc', directionLabel: 'Descending' },
    { label: 'Name', value: 'name_asc', directionLabel: 'A-Z' },
    { label: 'Name', value: 'name_desc', directionLabel: 'Z-A' },
    { label: 'Grade', value: 'grade_asc', directionLabel: 'Low to High' },
    { label: 'Grade', value: 'grade_desc', directionLabel: 'High to Low' },
    { label: 'Join Date', value: 'date_asc', directionLabel: 'Oldest First' },
    { label: 'Join Date', value: 'date_desc', directionLabel: 'Newest First' },
  ];
  const [sortSelected, setSortSelected] = useState(['name_asc']);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [gradeFilter, setGradeFilter] = useState<string[]>([]);
  const [busRouteFilter, setBusRouteFilter] = useState('');

  const handleFiltersClearAll = useCallback(() => {
    setStatusFilter([]);
    setGradeFilter([]);
    setBusRouteFilter('');
    setQueryValue('');
  }, []);

  const filters: Filter[] = [
    {
      key: 'status',
      label: 'Status',
      filter: (
        <ChoiceList
          title="Status"
          titleHidden
          choices={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]}
          selected={statusFilter}
          onChange={setStatusFilter}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'grade',
      label: 'Grade',
      filter: (
        <ChoiceList
          title="Grade"
          titleHidden
          choices={[
            { label: 'Grade 1', value: '1' },
            { label: 'Grade 2', value: '2' },
            { label: 'Grade 3', value: '3' },
            { label: 'Grade 4', value: '4' },
            { label: 'Grade 5', value: '5' },
            { label: 'Grade 6', value: '6' },
            { label: 'Grade 7', value: '7' },
            { label: 'Grade 8', value: '8' },
            { label: 'Grade 9', value: '9' },
            { label: 'Grade 10', value: '10' },
            { label: 'Grade 11', value: '11' },
            { label: 'Grade 12', value: '12' },
          ]}
          selected={gradeFilter}
          onChange={setGradeFilter}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'busRoute',
      label: 'Bus Route',
      filter: (
        <Input
          label="Bus Route"
          value={busRouteFilter}
          onChange={(e) => setBusRouteFilter(e.target.value)}
          placeholder="Enter route name..."
        />
      ),
    },
  ];

  const appliedFilters: AppliedFilter[] = [];
  if (statusFilter.length > 0) {
    appliedFilters.push({
      key: 'status',
      label: `Status: ${statusFilter.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}`,
      onRemove: () => setStatusFilter([]),
    });
  }
  if (gradeFilter.length > 0) {
    appliedFilters.push({
      key: 'grade',
      label: `Grade: ${gradeFilter.map(g => `Grade ${g}`).join(', ')}`,
      onRemove: () => setGradeFilter([]),
    });
  }
  if (busRouteFilter) {
    appliedFilters.push({
      key: 'busRoute',
      label: `Bus Route: ${busRouteFilter}`,
      onRemove: () => setBusRouteFilter(''),
    });
  }

  // Tabs/Views
  const [tabs] = useState<Tab[]>([
    {
      id: 'all',
      content: 'All Students',
      index: 0,
      isLocked: true,
    },
  ]);
  const [selectedTab, setSelectedTab] = useState(0);

  // Hooks
  const { mode, setMode } = useIndexFilters();
  const { selectedResources, handleSelectionChange, clearSelection } = 
    useIndexResourceState(filteredData, (item) => item.id);

  // Resource Name
  const resourceName = {
    singular: 'student',
    plural: 'students',
  };

  // Table Columns
  const columns = [
    { title: 'Student ID', sortable: true },
    { title: 'Name', sortable: true },
    { title: 'Grade', sortable: true },
    { title: 'Status' },
    { title: 'Bus Route' },
    { title: 'Parent Contact' },
  ];

  // Filter and Sort Data
  useEffect(() => {
    let result = [...students];

    // Apply search filter
    if (queryValue) {
      const query = queryValue.toLowerCase();
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.studentId.toLowerCase().includes(query) ||
          student.parentName.toLowerCase().includes(query) ||
          student.busRoute.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter((student) => statusFilter.includes(student.status));
    }

    // Apply grade filter
    if (gradeFilter.length > 0) {
      result = result.filter((student) => gradeFilter.includes(student.grade));
    }

    // Apply bus route filter
    if (busRouteFilter) {
      result = result.filter((student) =>
        student.busRoute.toLowerCase().includes(busRouteFilter.toLowerCase())
      );
    }

    // Apply sorting
    const [sortValue] = sortSelected;
    if (sortValue) {
      result.sort((a, b) => {
        switch (sortValue) {
          case 'id_asc':
            return a.studentId.localeCompare(b.studentId);
          case 'id_desc':
            return b.studentId.localeCompare(a.studentId);
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          case 'grade_asc':
            return parseInt(a.grade) - parseInt(b.grade);
          case 'grade_desc':
            return parseInt(b.grade) - parseInt(a.grade);
          case 'date_asc':
            return new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
          case 'date_desc':
            return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
          default:
            return 0;
        }
      });
    }

    setFilteredData(result);
  }, [students, queryValue, statusFilter, gradeFilter, busRouteFilter, sortSelected]);

  // Update data when initialData changes
  useEffect(() => {
    setStudents(initialData);
  }, [initialData]);

  // Bulk Actions
  const handleBulkActivate = () => {
    if (onBulkAction) {
      onBulkAction(selectedResources, 'activate');
    }
    clearSelection();
  };

  const handleBulkDeactivate = () => {
    if (onBulkAction) {
      onBulkAction(selectedResources, 'deactivate');
    }
    clearSelection();
  };

  const handleBulkExport = () => {
    if (onBulkAction) {
      onBulkAction(selectedResources, 'export');
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedResources.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedResources.length} {selectedResources.length === 1 ? 'student' : 'students'} selected
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleBulkActivate}>
                Activate
              </Button>
              <Button variant="secondary" size="sm" onClick={handleBulkDeactivate}>
                Deactivate
              </Button>
              <Button variant="secondary" size="sm" onClick={handleBulkExport}>
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <IndexFilters
          sortOptions={sortOptions}
          sortSelected={sortSelected}
          queryValue={queryValue}
          queryPlaceholder="Search students by name, ID, parent, or route..."
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
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm mb-4">
                {queryValue || appliedFilters.length > 0
                  ? 'No students match your filters'
                  : 'No students found'}
              </p>
              {(queryValue || appliedFilters.length > 0) && (
                <Button variant="secondary" size="sm" onClick={handleFiltersClearAll}>
                  Clear Filters
                </Button>
              )}
            </div>
          }
          renderRow={(student, index, isSelected) => (
            <>
              <IndexTableCell>
                <span className="font-semibold text-gray-900">{student.studentId}</span>
              </IndexTableCell>
              <IndexTableCell>
                <div>
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.address}</p>
                </div>
              </IndexTableCell>
              <IndexTableCell>
                <span className="text-gray-900">Grade {student.grade}</span>
              </IndexTableCell>
              <IndexTableCell>
                <Badge progress={student.status === 'active' ? 'complete' : 'incomplete'}>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </Badge>
              </IndexTableCell>
              <IndexTableCell>
                <span className="text-gray-900">{student.busRoute}</span>
              </IndexTableCell>
              <IndexTableCell>
                <div>
                  <p className="text-sm text-gray-900">{student.parentName}</p>
                  <p className="text-xs text-gray-500">{student.parentPhone}</p>
                </div>
              </IndexTableCell>
            </>
          )}
        />
      </Card>
    </div>
  );
}

