import { useState, useEffect } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import routeService from "../lib/api/routeService";

export default function RoutesList() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const data = await routeService.getRoutes();
      setRoutes(data);
    } catch (error: any) {
      toast.error("Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-2xl font-bold text-indigo-600">Tracksy Student</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
              <Link to="/bookings" className="text-gray-700 hover:text-indigo-600">My Bookings</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Routes</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <Link
              key={route.id}
              to={`/routes/${route.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{route.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {route.origin || route.start_point} → {route.destination || route.end_point}
              </p>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{route.distance ? `${(parseFloat(route.distance) / 1000).toFixed(1)} km` : 'N/A'}</span>
                <span>{route.estimated_duration ? `${route.estimated_duration} min` : 'N/A'}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
