// IndexTable Component System
// Professional admin table with all features

export { default as IndexTable, IndexTableCell } from './IndexTable';
export { default as IndexFilters } from './IndexFilters';
export { default as Badge } from './Badge';
export { default as ChoiceList } from './ChoiceList';
export { default as RangeSlider } from './RangeSlider';
export { useIndexFilters, useIndexResourceState } from './useIndexFilters';

export type {
  IndexTableProps,
  IndexFiltersProps,
  IndexTableColumn,
  Tab,
  TabAction,
  Filter,
  AppliedFilter,
  SortOption,
  PrimaryAction,
  ResourceName,
  BadgeProps,
  BadgeProgress,
  BadgeStatus,
  ChoiceListProps,
  Choice,
  RangeSliderProps,
} from './types';

