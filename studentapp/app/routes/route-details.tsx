import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import toast from "react-hot-toast";
import routeService from "../lib/api/routeService";

export default function RouteDetails() {
  const { id } = useParams();
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRoute(parseInt(id));
    }
  }, [id]);

  const loadRoute = async (routeId: number) => {
    try {
      const data = await routeService.getRoute(routeId);
      setRoute(data);
    } catch (error) {
      toast.error("Failed to load route details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/routes" className="text-indigo-600 hover:text-indigo-700">← Back to Routes</Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{route?.name}</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700">Route details will be displayed here</p>
        </div>
      </main>
    </div>
  );
}
