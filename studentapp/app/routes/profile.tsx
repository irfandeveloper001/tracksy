import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import authService from "../lib/api/authService";
import toast from "react-hot-toast";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  PencilIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authService.me();
      setUser(userData);
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        institution: userData.institution || "",
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await authService.updateProfile(formData);
      setUser(updatedUser);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <LoadingSpinner size="lg" text="Loading profile..." fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <UserCircleIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-lg text-gray-600">Manage your account information</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardBody className="text-center">
              <div className="inline-flex p-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4">
                <span className="text-5xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "S"}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.name}</h2>
              <p className="text-gray-600 mb-2">{user?.email}</p>
              <div className="inline-flex px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                {user?.role?.toUpperCase() || "STUDENT"}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Student ID</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {user?.student_id || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-sm font-semibold text-green-600">
                    {user?.status || "Active"}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Profile Information */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
              {!editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<PencilIcon className="w-4 h-4" />}
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardBody>
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution
                    </label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.institution}
                        onChange={(e) =>
                          setFormData({ ...formData, institution: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-4">
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: user?.name || "",
                          email: user?.email || "",
                          phone: user?.phone || "",
                          institution: user?.institution || "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <UserCircleIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Email Address</p>
                      <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <PhoneIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {user?.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Student ID</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {user?.student_id || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <BuildingOfficeIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Institution</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {user?.institution || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <KeyIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Password</p>
                  <p className="text-sm text-gray-600">
                    Change your password to keep your account secure
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => toast.info("Change password feature coming soon!")}
              >
                Change Password
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
