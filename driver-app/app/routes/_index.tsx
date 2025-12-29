import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Immediate redirect - no delay needed in SPA mode
    const token = localStorage.getItem('@tracksy_driver:auth_token');
    
    if (token) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Tracksy Driver...</p>
      </div>
    </div>
  );
}



