import React from 'react';
import { Link } from 'react-router';

export default function Sidebar() {
  return (
    <aside className="bg-gray-50 w-64 min-h-screen border-r">
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-200">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/buses" className="block px-4 py-2 rounded hover:bg-gray-200">
              Buses
            </Link>
          </li>
          <li>
            <Link to="/routes" className="block px-4 py-2 rounded hover:bg-gray-200">
              Routes
            </Link>
          </li>
          <li>
            <Link to="/users" className="block px-4 py-2 rounded hover:bg-gray-200">
              Users
            </Link>
          </li>
          <li>
            <Link to="/analytics" className="block px-4 py-2 rounded hover:bg-gray-200">
              Analytics
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

