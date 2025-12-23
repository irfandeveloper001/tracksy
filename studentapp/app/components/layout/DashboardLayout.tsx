import { useState } from "react";
import { useNavigate } from "react-router";
import Sidebar from "./Sidebar";
import authService from "../../lib/api/authService";
import { Bars3Icon, XMarkIcon, BellIcon } from "@heroicons/react/24/outline";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: any;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Sidebar - Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {sidebarOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
              <div className="ml-4 lg:ml-0">
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome, {user?.name || 'Student'}!
                </h2>
                <p className="text-sm text-gray-600">
                  Student ID: {user?.student_id || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
