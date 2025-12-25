import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card, { CardBody, CardHeader } from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import busService from "../lib/api/busService";
import authService from "../lib/api/authService";
import toast from "react-hot-toast";
import { TruckIcon, MapPinIcon, SignalIcon, ClockIcon } from "@heroicons/react/24/outline";

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
        <LoadingSpinner size="lg" text="Loading tracking information..." fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <MapPinIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Track Bus
              </h1>
              <p className="text-lg text-gray-600">Real-time bus location tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <SignalIcon className="w-5 h-5 text-green-600 animate-pulse" />
            <span className="text-sm text-gray-600">Live updates every 10 seconds</span>
          </div>
        </div>

        {/* Map Placeholder */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Live Map View</h2>
          </CardHeader>
          <CardBody>
            <div className="aspect-video bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-indigo-300 relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse delay-150"></div>
              </div>
              
              <div className="text-center relative z-10">
                <div className="inline-flex p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl mb-4">
                  <MapPinIcon className="w-16 h-16 text-indigo-600 animate-bounce" />
                </div>
                <p className="text-gray-900 font-bold text-xl mb-2">Interactive Map View</p>
                <p className="text-gray-600">Real-time bus tracking map will appear here</p>
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <span className="text-sm text-green-600 font-medium">Live Tracking Active</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Active Buses List */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Active Buses</h2>
              <p className="text-sm text-gray-600 mt-1">{buses.length} bus(es) currently in service</p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">Live</span>
            </div>
          </CardHeader>
          <CardBody>
            {buses.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                  <TruckIcon className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg mb-2">No active buses at the moment</p>
                <p className="text-gray-500 text-sm">Check back later for live tracking</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buses.map((bus) => (
                  <Card 
                    key={bus.id}
                    hover
                    gradient
                  >
                    <CardBody>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
                            <TruckIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{bus.license_plate}</h3>
                            <p className="text-sm text-gray-600">
                              {bus.model}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-700 font-bold">Active</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Capacity</p>
                          <p className="text-lg font-bold text-gray-900">{bus.capacity}</p>
                          <p className="text-xs text-gray-500">seats</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Status</p>
                          <p className="text-lg font-bold text-green-600">Online</p>
                          <p className="text-xs text-gray-500">tracking</p>
                        </div>
                      </div>

                      <button className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center space-x-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>View on Map</span>
                      </button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Last Updated Info */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
