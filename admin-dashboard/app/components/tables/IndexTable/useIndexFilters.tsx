// useIndexFilters Hook
// Manages state for IndexFilters component

import { useState, useCallback } from 'react';

export function useIndexFilters() {
  const [mode, setMode] = useState<'DEFAULT' | 'FILTERING'>('DEFAULT');

  return {
    mode,
    setMode,
  };
}

// Hook for managing resource selection
export function useIndexResourceState<T>(
  resources: T[],
  getId: (resource: T) => string = (resource: any) => resource.id
) {
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  const allResourcesSelected =
    resources.length > 0 && selectedResources.length === resources.length;

  const handleSelectionChange = useCallback(
    (selectedIds: string[]) => {
      setSelectedResources(selectedIds);
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedResources([]);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedResources(resources.map(getId));
  }, [resources, getId]);

  return {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
    clearSelection,
    selectAll,
  };
}

