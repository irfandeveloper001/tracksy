import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";
import authService from "../../lib/api/authService";
import toast from "react-hot-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: any;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error('Failed to logout');
      navigate("/login");
    }
  };

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Sidebar - Single instance that adapts to screen size */}
      <Sidebar
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-0">
        {/* Top Bar */}
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
          user={user}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
