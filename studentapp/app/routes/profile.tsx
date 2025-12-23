import { Link } from "react-router";

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-700">← Back to Dashboard</Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700">Profile settings will be displayed here</p>
        </div>
      </main>
    </div>
  );
}
