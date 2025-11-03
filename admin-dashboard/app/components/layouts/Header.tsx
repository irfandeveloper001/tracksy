import React from 'react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Tracksy Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* User menu, notifications, etc. */}
          </div>
        </div>
      </div>
    </header>
  );
}

