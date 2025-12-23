import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import busService from "../lib/api/busService";
import authService from "../lib/api/authService";
import toast from "react-hot-toast";
import { TruckIcon, MapPinIcon } from "@heroicons/react/24/outline";

export default function Tracking() {
  const [user, setUser] = useState<any>(null);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [userData, busesData] = await Promise.all([
        authService.me(),
        busService.getBuses(),
      ]);
      setUser(userData);
      setBuses(busesData);
    } catch (error) {
      toast.error("Failed to load bus locations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading tracking info...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Bus</h1>
          <p className="text-gray-600">Real-time bus locations</p>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPinIcon className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-700 font-semibold">Map View</p>
              <p className="text-gray-500 text-sm">Real-time bus tracking map integration</p>
            </div>
          </div>
        </div>

        {/* Active Buses List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Buses</h2>
          {buses.length === 0 ? (
            <div className="text-center py-8">
              <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No active buses at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {buses.map((bus) => (
                <div
                  key={bus.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <TruckIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{bus.license_plate}</h3>
                        <p className="text-sm text-gray-600">
                          {bus.model} • {bus.capacity} seats
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
