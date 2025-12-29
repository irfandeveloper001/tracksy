import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card, { CardBody } from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import routeService from "../../lib/api/routeService";
import authService from "../../lib/api/authService";
import toast from "react-hot-toast";
import { 
  MapIcon, 
  MagnifyingGlassIcon, 
  ClockIcon, 
  ArrowRightIcon,
  MapPinIcon 
} from "@heroicons/react/24/outline";

export default function Routes() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = routes.filter(route =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (route.origin || route.start_point || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (route.destination || route.end_point || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoutes(filtered);
    } else {
      setFilteredRoutes(routes);
    }
  }, [searchTerm, routes]);

  const loadData = async () => {
    try {
      const [userData, routesData] = await Promise.all([
        authService.me(),
        routeService.getRoutes(),
      ]);
      setUser(userData);
      setRoutes(routesData);
      setFilteredRoutes(routesData);
    } catch (error) {
      toast.error("Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <LoadingSpinner size="lg" text="Loading available routes..." fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <MapIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Available Routes
              </h1>
              <p className="text-lg text-gray-600">Explore and book your preferred bus routes</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <MapPinIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">{routes.length} routes available</span>
          </div>
        </div>

        {/* Search Bar */}
        <Card gradient>
          <CardBody>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search routes by name, origin, or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg"
              />
            </div>
            {searchTerm && (
              <p className="mt-3 text-sm text-gray-600">
                Found {filteredRoutes.length} route{filteredRoutes.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardBody>
        </Card>

        {/* Routes Grid */}
        {filteredRoutes.length === 0 ? (
          <Card>
            <CardBody className="text-center py-16">
              <div className="inline-flex p-6 bg-blue-100 rounded-full mb-4">
                <MapIcon className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No routes found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'No routes are currently available'}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutes.map((route) => (
              <Card 
                key={route.id}
                hover
                gradient
                onClick={() => navigate(`/routes/${route.id}`)}
              >
                <CardBody>
                  {/* Route Header */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{route.name}</h3>
                  </div>

                  {/* Route Journey */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-xs text-gray-500 font-semibold uppercase">Starting Point</p>
                        <p className="text-gray-900 font-bold text-lg">{route.origin || route.start_point}</p>
                      </div>
                    </div>
                    
                    <div className="ml-5 border-l-4 border-dashed border-gray-300 h-8"></div>
                    
                    <div className="flex items-start">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                          <MapPinIcon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-xs text-gray-500 font-semibold uppercase">Destination</p>
                        <p className="text-gray-900 font-bold text-lg">{route.destination || route.end_point}</p>
                      </div>
                    </div>
                  </div>

                  {/* Route Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-gray-200">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <MapIcon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600 font-semibold">Distance</p>
                      <p className="font-bold text-gray-900 text-lg">
                        {route.distance ? `${(parseFloat(route.distance) / 1000).toFixed(1)} km` : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                      <ClockIcon className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600 font-semibold">Duration</p>
                      <p className="font-bold text-gray-900 text-lg">
                        {route.estimated_duration ? `${route.estimated_duration} min` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* View Button */}
                  <button 
                    className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-bold flex items-center justify-center space-x-2"
                    onClick={() => navigate(`/routes/${route.id}`)}
                  >
                    <span>View Details</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
