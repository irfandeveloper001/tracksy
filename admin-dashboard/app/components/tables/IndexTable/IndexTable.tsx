// IndexTable Component
// Advanced data table with selection, sorting, and beautiful styling

import { useState } from 'react';
import type { IndexTableProps } from './types';
import LoadingSpinner from '../../ui/LoadingSpinner';

export default function IndexTable<T = any>({
  columns,
  data,
  resourceName,
  selectedItems = [],
  onSelectionChange,
  condensed = false,
  loading = false,
  emptyState,
  renderRow,
  getItemId,
}: IndexTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const allSelected = data.length > 0 && selectedItems.length === data.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < data.length;

  const handleSelectAll = () => {
    if (onSelectionChange) {
      if (allSelected) {
        onSelectionChange([]);
      } else {
        onSelectionChange(data.map((item) => getItemId(item)));
      }
    }
  };

  const handleSelectItem = (id: string) => {
    if (onSelectionChange) {
      if (selectedItems.includes(id)) {
        onSelectionChange(selectedItems.filter((itemId) => itemId !== id));
      } else {
        onSelectionChange([...selectedItems, id]);
      }
    }
  };

  const selectedCount = selectedItems.length;
  const totalCount = data.length;

  return (
    <div className="bg-white">
      {/* Selection Bar */}
      {selectedCount > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedCount === totalCount
                ? `All ${totalCount} ${totalCount === 1 ? resourceName.singular : resourceName.plural} selected`
                : `${selectedCount} ${selectedCount === 1 ? resourceName.singular : resourceName.plural} selected`}
            </span>
            <button
              onClick={() => onSelectionChange?.([])}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : data.length === 0 ? (
          <div className="py-12">
            {emptyState || (
              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  No {resourceName.plural} found
                </p>
              </div>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Selection Column */}
                {onSelectionChange && (
                  <th scope="col" className={`${condensed ? 'px-3 py-2' : 'px-6 py-3'} w-12`}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = someSelected;
                        }
                      }}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                )}

                {/* Data Columns */}
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`
                      ${condensed ? 'px-3 py-2' : 'px-6 py-3'}
                      text-left text-xs font-semibold text-gray-700 uppercase tracking-wider
                      ${column.alignment === 'end' ? 'text-right' : ''}
                      ${column.alignment === 'center' ? 'text-center' : ''}
                    `}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => {
                const itemId = getItemId(item);
                const isSelected = selectedItems.includes(itemId);
                const isHovered = hoveredRow === itemId;

                return (
                  <tr
                    key={itemId}
                    onMouseEnter={() => setHoveredRow(itemId)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`
                      transition-colors cursor-pointer
                      ${isSelected ? 'bg-blue-50' : isHovered ? 'bg-gray-50' : ''}
                    `}
                    onClick={() => handleSelectItem(itemId)}
                  >
                    {/* Selection Cell */}
                    {onSelectionChange && (
                      <td className={`${condensed ? 'px-3 py-2' : 'px-6 py-4'} w-12`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Data Cells */}
                    {renderRow(item, index, isSelected)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Table Cell Component for consistency
export function IndexTableCell({
  children,
  alignment = 'start',
  condensed = false,
  className = '',
}: {
  children: React.ReactNode;
  alignment?: 'start' | 'center' | 'end';
  condensed?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`
        ${condensed ? 'px-3 py-2' : 'px-6 py-4'}
        text-sm text-gray-900
        ${alignment === 'end' ? 'text-right' : ''}
        ${alignment === 'center' ? 'text-center' : ''}
        ${className}
      `}
    >
      {children}
    </td>
  );
}

