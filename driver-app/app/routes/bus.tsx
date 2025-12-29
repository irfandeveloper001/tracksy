import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../src/store/store";
import { getCurrentUser } from "../../src/store/slices/authSlice";
import Header from "../../src/components/layouts/Header";
import Sidebar from "../../src/components/layouts/Sidebar";
import {
  TruckIcon,
  IdentificationIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function BusPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadBusData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadBusData, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const loadBusData = async () => {
    try {
      await dispatch(getCurrentUser());
    } catch (error) {
      console.warn('⚠️ Error loading bus data:', error);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const assignedBus = user?.assigned_bus;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 w-full min-w-0">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  My Bus
                </h1>
                <p className="mt-2 text-gray-600">
                  View your assigned bus information
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : assignedBus ? (
                <>
                  {/* Bus Information Card */}
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-4 bg-indigo-100 rounded-xl">
                          <TruckIcon className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            Bus #{assignedBus.bus_number || 'N/A'}
                          </h2>
                          <p className="text-sm text-gray-500">License: {assignedBus.license_plate || 'N/A'}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(assignedBus.status)}`}>
                        {assignedBus.status || 'Active'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center space-x-3 mb-2">
                          <IdentificationIcon className="h-5 w-5 text-blue-600" />
                          <p className="text-sm font-semibold text-gray-700">Bus Type</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 capitalize">
                          {assignedBus.bus_type || 'Standard'}
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center space-x-3 mb-2">
                          <TruckIcon className="h-5 w-5 text-green-600" />
                          <p className="text-sm font-semibold text-gray-700">Capacity</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {assignedBus.capacity || 'N/A'} <span className="text-base font-normal text-gray-600">seats</span>
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center space-x-3 mb-2">
                          <CalendarIcon className="h-5 w-5 text-purple-600" />
                          <p className="text-sm font-semibold text-gray-700">Status</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 capitalize">
                          {assignedBus.status || 'Active'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Route (if any) */}
                  {assignedBus.current_route_id && user?.assigned_route && (
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Assigned Route</h3>
                      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                        <p className="text-lg font-semibold text-gray-900">
                          {user.assigned_route.name || 'Unnamed Route'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {user.assigned_route.start_location || user.assigned_route.start_point || user.assigned_route.origin || 'N/A'} → {user.assigned_route.end_location || user.assigned_route.end_point || user.assigned_route.destination || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-12 text-center">
                  <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bus Assigned</h3>
                  <p className="text-gray-500 mb-6">
                    You don't have an assigned bus yet. Please contact your administrator.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}













