// Demo Table Route
// Test and showcase the IndexTable component system

import { useState } from 'react';
import IndexTableExample from '~/components/tables/IndexTable/Example';

export default function DemoTablePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            IndexTable Component Demo
          </h1>
          <p className="mt-2 text-gray-600">
            Professional admin table with filtering, sorting, search, and views
          </p>
        </div>

        {/* Features List */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ✨ Features Included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <p className="font-medium text-gray-900">Advanced Filtering</p>
                <p className="text-sm text-gray-600">
                  Multiple filter types with applied filters display
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <p className="font-medium text-gray-900">Full-Text Search</p>
                <p className="text-sm text-gray-600">
                  Real-time search with clear functionality
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <p className="font-medium text-gray-900">Sorting Options</p>
                <p className="text-sm text-gray-600">
                  Multiple sort fields with direction control
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <p className="font-medium text-gray-900">Views/Tabs</p>
                <p className="text-sm text-gray-600">
                  Create, rename, duplicate, delete saved views
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <p className="font-medium text-gray-900">Row Selection</p>
                <p className="text-sm text-gray-600">
                  Bulk actions with select all functionality
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <p className="font-medium text-gray-900">Status Badges</p>
                <p className="text-sm text-gray-600">
                  Color-coded progress and status indicators
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Demo */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Live Demo
          </h2>
          <IndexTableExample />
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            📚 How to Use
          </h2>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>1. Search:</strong> Use the search bar to filter items by text
            </p>
            <p>
              <strong>2. Filter:</strong> Click the Filters button to show filter options
            </p>
            <p>
              <strong>3. Sort:</strong> Click the Sort dropdown to change sorting order
            </p>
            <p>
              <strong>4. Tabs:</strong> Switch between different views, create new ones
            </p>
            <p>
              <strong>5. Select:</strong> Check boxes to select rows for bulk actions
            </p>
            <p>
              <strong>6. View Code:</strong> Check{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">
                app/components/tables/IndexTable/Example.tsx
              </code>
            </p>
          </div>
        </div>

        {/* Quick Start */}
        <div className="mt-8 bg-gray-900 text-gray-100 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">🚀 Quick Start</h2>
          <pre className="text-sm overflow-x-auto">
            <code>{`import { IndexTable, IndexFilters, Badge } from '~/components/tables/IndexTable';

// Use the Template.tsx file for a quick starting point
// Copy and customize for your specific table needs`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

