import { useEffect } from "react";
import { useNavigate } from "react-router";
import { secureStorage } from "../lib/api/client";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await secureStorage.getToken();
      if (token) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

