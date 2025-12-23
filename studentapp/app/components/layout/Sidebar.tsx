import { Link, useLocation } from "react-router";
import { 
  HomeIcon, 
  MapIcon, 
  BookmarkIcon, 
  TruckIcon,
  BanknotesIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  MapIcon as MapIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  TruckIcon as TruckIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  BellIcon as BellIconSolid,
  UserCircleIcon as UserCircleIconSolid
} from "@heroicons/react/24/solid";

interface NavItem {
  name: string;
  path: string;
  icon: any;
  iconSolid: any;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
  { name: 'Routes', path: '/routes', icon: MapIcon, iconSolid: MapIconSolid },
  { name: 'My Bookings', path: '/bookings', icon: BookmarkIcon, iconSolid: BookmarkIconSolid },
  { name: 'Fees & Payments', path: '/fees', icon: BanknotesIcon, iconSolid: BanknotesIconSolid },
  { name: 'Track Bus', path: '/tracking', icon: TruckIcon, iconSolid: TruckIconSolid },
  { name: 'Notifications', path: '/notifications', icon: BellIcon, iconSolid: BellIconSolid },
  { name: 'Profile', path: '/profile', icon: UserCircleIcon, iconSolid: UserCircleIconSolid },
];

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-900 to-indigo-800">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-indigo-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">T</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Tracksy</h1>
            <p className="text-xs text-indigo-300">Student Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = isActive(item.path) ? item.iconSolid : item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-white text-indigo-900 shadow-lg'
                  : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
              }`}
            >
              <Icon className="w-6 h-6 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="px-3 py-4 border-t border-indigo-700 space-y-2">
        <Link
          to="/settings"
          className="flex items-center px-4 py-3 text-indigo-100 rounded-lg hover:bg-indigo-700 hover:text-white transition-all"
        >
          <Cog6ToothIcon className="w-6 h-6 mr-3" />
          <span className="font-medium">Settings</span>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 text-indigo-100 rounded-lg hover:bg-red-600 hover:text-white transition-all"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
