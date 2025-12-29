import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import Header from './Header';
import Sidebar from './Sidebar';
import BreadcrumbWrapper from './BreadcrumbWrapper';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-50/80 overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto relative">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl"></div>
            <div className="absolute top-1/3 -left-24 h-56 w-56 rounded-full bg-sky-200/50 blur-3xl"></div>
            <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <BreadcrumbWrapper />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
