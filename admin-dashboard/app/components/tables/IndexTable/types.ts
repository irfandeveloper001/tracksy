// IndexTable Types
// Comprehensive type definitions for the IndexTable component system

import { ReactNode } from 'react';

// Badge Types
export type BadgeProgress = 'complete' | 'partiallyComplete' | 'incomplete';
export type BadgeStatus = 'success' | 'info' | 'warning' | 'critical' | 'attention' | 'default';

export interface BadgeProps {
  progress?: BadgeProgress;
  status?: BadgeStatus;
  children: ReactNode;
}

// Tab Types
export interface TabAction {
  type: 'rename' | 'duplicate' | 'edit' | 'delete';
  onAction?: () => void;
  onPrimaryAction?: (value: string) => Promise<boolean>;
}

export interface Tab {
  id: string;
  content: string;
  index: number;
  isLocked?: boolean;
  actions?: TabAction[];
  onAction?: () => void;
}

// Filter Types
export interface Filter {
  key: string;
  label: string;
  filter: ReactNode;
  shortcut?: boolean;
}

export interface AppliedFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

// Sort Types
export interface SortOption {
  label: string;
  value: string;
  directionLabel: string;
}

// Primary Action Types
export type PrimaryAction =
  | {
      type: 'save';
      onAction: () => Promise<boolean>;
      disabled?: boolean;
      loading?: boolean;
    }
  | {
      type: 'save-as';
      onAction: (value: string) => Promise<boolean>;
      disabled?: boolean;
      loading?: boolean;
    };

// IndexFilters Props
export interface IndexFiltersProps {
  tabs?: Tab[];
  selected?: number;
  onSelect?: (index: number) => void;
  canCreateNewView?: boolean;
  onCreateNewView?: (name: string) => Promise<boolean>;
  sortOptions: SortOption[];
  sortSelected: string[];
  onSort: (selected: string[]) => void;
  queryValue: string;
  queryPlaceholder?: string;
  onQueryChange: (value: string) => void;
  onQueryClear: () => void;
  primaryAction?: PrimaryAction;
  cancelAction?: {
    onAction: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  filters: Filter[];
  appliedFilters: AppliedFilter[];
  onClearAll: () => void;
  mode?: 'DEFAULT' | 'FILTERING';
  setMode?: (mode: 'DEFAULT' | 'FILTERING') => void;
}

// IndexTable Props
export interface IndexTableColumn {
  title: string;
  alignment?: 'start' | 'center' | 'end';
  sortable?: boolean;
}

export interface ResourceName {
  singular: string;
  plural: string;
}

export interface IndexTableProps<T = any> {
  columns: IndexTableColumn[];
  data: T[];
  resourceName: ResourceName;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  condensed?: boolean;
  loading?: boolean;
  emptyState?: ReactNode;
  renderRow: (item: T, index: number, isSelected: boolean) => ReactNode;
  getItemId: (item: T) => string;
}

// ChoiceList Props
export interface Choice {
  label: string;
  value: string;
  disabled?: boolean;
  helpText?: string;
}

export interface ChoiceListProps {
  title?: string;
  titleHidden?: boolean;
  choices: Choice[];
  selected: string[];
  onChange: (selected: string[]) => void;
  allowMultiple?: boolean;
  disabled?: boolean;
}

// RangeSlider Props
export interface RangeSliderProps {
  label?: string;
  labelHidden?: boolean;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  output?: boolean;
  disabled?: boolean;
}

