// IndexFilters Component
// Advanced filtering interface with tabs, search, filters, and sorting

import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PlusIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import type { IndexFiltersProps } from './types';
import Button from '../../ui/Button';

export default function IndexFilters({
  tabs = [],
  selected = 0,
  onSelect,
  canCreateNewView = false,
  onCreateNewView,
  sortOptions,
  sortSelected,
  onSort,
  queryValue,
  queryPlaceholder = 'Search...',
  onQueryChange,
  onQueryClear,
  primaryAction,
  cancelAction,
  filters,
  appliedFilters,
  onClearAll,
  mode = 'DEFAULT',
  setMode,
}: IndexFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showNewViewModal, setShowNewViewModal] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renamingTabIndex, setRenamingTabIndex] = useState<number | null>(null);

  const handleCreateView = async () => {
    if (onCreateNewView && newViewName.trim()) {
      const success = await onCreateNewView(newViewName);
      if (success) {
        setShowNewViewModal(false);
        setNewViewName('');
      }
    }
  };

  const handleRenameTab = async (index: number) => {
    const tab = tabs[index];
    const renameAction = tab.actions?.find((a) => a.type === 'rename');
    if (renameAction?.onPrimaryAction && renameValue.trim()) {
      const success = await renameAction.onPrimaryAction(renameValue);
      if (success) {
        setShowRenameModal(false);
        setRenameValue('');
        setRenamingTabIndex(null);
      }
    }
  };

  const handleDuplicateTab = async (index: number) => {
    const tab = tabs[index];
    const duplicateAction = tab.actions?.find((a) => a.type === 'duplicate');
    if (duplicateAction?.onPrimaryAction) {
      await duplicateAction.onPrimaryAction(`${tab.content} (Copy)`);
    }
  };

  const handleDeleteTab = async (index: number) => {
    const tab = tabs[index];
    const deleteAction = tab.actions?.find((a) => a.type === 'delete');
    if (deleteAction?.onPrimaryAction) {
      await deleteAction.onPrimaryAction();
    }
  };

  const selectedSort = sortOptions.find((opt) => sortSelected.includes(opt.value));

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Tabs */}
      {tabs.length > 0 && (
        <div className="border-b border-gray-200">
          <div className="flex items-center px-6">
            <nav className="flex space-x-1 flex-1 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onSelect?.(tab.index)}
                  className={`
                    group relative px-4 py-3 text-sm font-medium whitespace-nowrap
                    transition-colors
                    ${
                      selected === tab.index
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                    }
                  `}
                >
                  <span>{tab.content}</span>
                  
                  {/* Tab Actions Dropdown */}
                  {!tab.isLocked && tab.actions && tab.actions.length > 0 && (
                    <Menu as="div" className="inline-block ml-2">
                      <Menu.Button
                        className="inline-flex items-center text-gray-400 hover:text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ChevronDownIcon className="w-3 h-3" />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            {tab.actions.map((action) => (
                              <Menu.Item key={action.type}>
                                {({ active }) => (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (action.type === 'rename') {
                                        setRenamingTabIndex(tab.index);
                                        setRenameValue(tab.content);
                                        setShowRenameModal(true);
                                      } else if (action.type === 'duplicate') {
                                        handleDuplicateTab(tab.index);
                                      } else if (action.type === 'delete') {
                                        handleDeleteTab(tab.index);
                                      } else if (action.onAction) {
                                        action.onAction();
                                      }
                                    }}
                                    className={`
                                      ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}
                                      block w-full text-left px-4 py-2 text-sm capitalize
                                    `}
                                  >
                                    {action.type}
                                  </button>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  )}
                </button>
              ))}
            </nav>
            
            {canCreateNewView && (
              <button
                onClick={() => setShowNewViewModal(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Create view
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={queryValue}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={queryPlaceholder}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {queryValue && (
              <button
                onClick={onQueryClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
              ${
                showFilters || appliedFilters.length > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <FunnelIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Filters</span>
            {appliedFilters.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-semibold">
                {appliedFilters.length}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">
                {selectedSort ? `${selectedSort.label} (${selectedSort.directionLabel})` : 'Sort'}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <Menu.Item key={option.value}>
                      {({ active }) => (
                        <button
                          onClick={() => onSort([option.value])}
                          className={`
                            ${active ? 'bg-gray-100' : ''}
                            ${sortSelected.includes(option.value) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                            block w-full text-left px-4 py-2 text-sm
                          `}
                        >
                          {option.label} - {option.directionLabel}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Primary Action */}
          {primaryAction && (
            <Button
              variant="primary"
              size="md"
              isLoading={primaryAction.loading}
              disabled={primaryAction.disabled}
              onClick={() => {
                if (primaryAction.type === 'save') {
                  primaryAction.onAction();
                } else if (primaryAction.type === 'save-as') {
                  setShowNewViewModal(true);
                }
              }}
            >
              {primaryAction.type === 'save' ? 'Save' : 'Save as'}
            </Button>
          )}
        </div>

        {/* Applied Filters */}
        {appliedFilters.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-sm text-gray-600">Filters:</span>
            {appliedFilters.map((filter) => (
              <span
                key={filter.key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {filter.label}
                <button
                  onClick={filter.onRemove}
                  className="hover:text-gray-900"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
            <button
              onClick={onClearAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <div className="font-medium text-sm text-gray-700 mb-2">{filter.label}</div>
                  {filter.filter}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New View Modal */}
      {showNewViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create new view</h3>
            <input
              type="text"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="View name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateView()}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowNewViewModal(false);
                  setNewViewName('');
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateView}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && renamingTabIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rename view</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="View name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleRenameTab(renamingTabIndex)}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameValue('');
                  setRenamingTabIndex(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={() => handleRenameTab(renamingTabIndex)}>
                Rename
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

