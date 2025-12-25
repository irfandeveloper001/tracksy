import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import authService from "../lib/api/authService";
import {
  UserCircleIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.me();
      setUser(userData);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: UserCircleIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "security", name: "Security", icon: LockClosedIcon },
    { id: "preferences", name: "Preferences", icon: PaintBrushIcon },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Profile Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name || ""}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || ""}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        defaultValue={user?.phone || ""}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Notification Preferences
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label: "Email Notifications", checked: true },
                      { label: "Push Notifications", checked: true },
                      { label: "SMS Notifications", checked: false },
                      { label: "Booking Updates", checked: true },
                      { label: "Fee Reminders", checked: true },
                      { label: "Bus Location Updates", checked: true },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-3 border-b border-gray-200"
                      >
                        <span className="text-gray-700">{item.label}</span>
                        <input
                          type="checkbox"
                          defaultChecked={item.checked}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Security Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Preferences
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option>Light</option>
                        <option>Dark</option>
                        <option>Auto</option>
                      </select>
                    </div>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

