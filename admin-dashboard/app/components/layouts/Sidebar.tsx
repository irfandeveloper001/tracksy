import { Link, useLocation } from 'react-router';
import { useState } from 'react';
import {
  HomeIcon,
  TruckIcon,
  MapIcon,
  UserGroupIcon,
  UserIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  BellAlertIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  TicketIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  TruckIcon as TruckIconSolid,
  MapIcon as MapIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  UserIcon as UserIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  BellAlertIcon as BellAlertIconSolid,
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
  MapPinIcon as MapPinIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  ReceiptPercentIcon as ReceiptPercentIconSolid,
  TicketIcon as TicketIconSolid,
} from '@heroicons/react/24/solid';
import { useAuthStore } from '../../lib/store/authStore';
import { hasPermission, PERMISSIONS } from '../../lib/utils/permissions';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      permission: PERMISSIONS.ANALYTICS_VIEW,
      badge: null,
      section: 'main',
    },
    {
      name: 'Buses',
      href: '/buses',
      icon: TruckIcon,
      iconSolid: TruckIconSolid,
      permission: PERMISSIONS.BUSES_VIEW,
      badge: null,
      section: 'fleet',
    },
    {
      name: 'Routes',
      href: '/routes',
      icon: MapIcon,
      iconSolid: MapIconSolid,
      permission: PERMISSIONS.ROUTES_VIEW,
      badge: null,
      section: 'fleet',
    },
    {
      name: 'Stops',
      href: '/stops',
      icon: MapPinIcon,
      iconSolid: MapPinIconSolid,
      permission: PERMISSIONS.ROUTES_VIEW,
      badge: null,
      section: 'fleet',
    },
    {
      name: 'Live Map',
      href: '/live-map',
      icon: MapIcon,
      iconSolid: MapIconSolid,
      permission: PERMISSIONS.BUSES_VIEW,
      badge: null,
      section: 'fleet',
    },
    {
      name: 'Students',
      href: '/students',
      icon: UserGroupIcon,
      iconSolid: UserGroupIconSolid,
      permission: PERMISSIONS.USERS_VIEW,
      badge: null,
      section: 'users',
    },
    {
      name: 'Drivers',
      href: '/drivers',
      icon: UserIcon,
      iconSolid: UserIconSolid,
      permission: PERMISSIONS.USERS_VIEW,
      badge: null,
      section: 'users',
    },
    {
      name: 'Admins',
      href: '/admins',
      icon: UserIcon,
      iconSolid: UserIconSolid,
      permission: PERMISSIONS.USERS_VIEW,
      badge: null,
      section: 'users',
    },
    {
      name: 'Trips',
      href: '/trips',
      icon: MapPinIcon,
      iconSolid: MapPinIconSolid,
      permission: PERMISSIONS.BUSES_VIEW,
      badge: null,
      section: 'operations',
    },
    {
      name: 'Bookings',
      href: '/bookings',
      icon: TicketIcon,
      iconSolid: TicketIconSolid,
      permission: PERMISSIONS.USERS_VIEW,
      badge: null,
      section: 'operations',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
      permission: PERMISSIONS.ANALYTICS_VIEW,
      badge: null,
      section: 'insights',
    },
    {
      name: 'Fee Management',
      href: '/fees',
      icon: BanknotesIcon,
      iconSolid: BanknotesIconSolid,
      permission: PERMISSIONS.USERS_VIEW,
      badge: null,
      section: 'financial',
    },
    {
      name: 'Invoice Generator',
      href: '/fees/invoices',
      icon: ReceiptPercentIcon,
      iconSolid: ReceiptPercentIconSolid,
      permission: PERMISSIONS.USERS_VIEW,
      badge: null,
      section: 'financial',
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: DocumentTextIcon,
      iconSolid: DocumentTextIconSolid,
      permission: PERMISSIONS.REPORTS_VIEW,
      badge: null,
      section: 'insights',
    },
    {
      name: 'Alerts',
      href: '/alerts',
      icon: BellAlertIcon,
      iconSolid: BellAlertIconSolid,
      permission: PERMISSIONS.ALERTS_VIEW,
      badge: 5,
      section: 'system',
    },
    {
      name: 'Maintenance',
      href: '/maintenance',
      icon: WrenchScrewdriverIcon,
      iconSolid: WrenchScrewdriverIconSolid,
      permission: PERMISSIONS.BUSES_VIEW,
      badge: 2,
      section: 'system',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIcon,
      permission: PERMISSIONS.SETTINGS_VIEW,
      badge: null,
      section: 'system',
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    hasPermission(user, item.permission)
  );

  const sections = {
    main: 'Main',
    fleet: 'Fleet Management',
    users: 'User Management',
    operations: 'Operations',
    financial: 'Financial',
    insights: 'Insights & Reports',
    system: 'System',
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 z-40 lg:hidden backdrop-blur-md"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${isCollapsed ? 'w-20' : 'w-72'}
          bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          shadow-2xl border-r border-white/10
        `}
      >
        <div className="flex flex-col h-full relative">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50 pointer-events-none"></div>
          <div className="absolute inset-0 backdrop-blur-3xl opacity-20 pointer-events-none"></div>

          {/* Logo Section */}
          <div className="relative flex items-center justify-between h-20 px-4 border-b border-white/10 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-xl">
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-xl flex items-center justify-center shadow-xl transform hover:rotate-12 hover:scale-110 transition-all duration-300 cursor-pointer">
                  <span className="text-3xl font-black bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">T</span>
                </div>
              </div>
              {!isCollapsed && (
                <div className="animate-in fade-in slide-in-from-left duration-300">
                  <h1 className="text-xl font-bold text-white tracking-tight">Tracksy</h1>
                  <p className="text-xs text-blue-300 flex items-center font-semibold">
                    <SparklesIcon className="w-3 h-3 mr-1 animate-pulse" />
                    Admin Portal
                  </p>
                </div>
              )}
            </div>
            
            {/* Collapse button - Desktop only */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 hover:scale-110"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-4 h-4 text-white" />
              ) : (
                <ChevronLeftIcon className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          {/* User Profile Section */}
          {!isCollapsed && user && (
            <div className="relative p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name || 'Admin User'}</p>
                  <p className="text-xs text-blue-300 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="relative flex-1 px-3 py-4 overflow-y-auto custom-scrollbar space-y-6">
            {Object.entries(sections).map(([sectionKey, sectionName]) => {
              const sectionItems = filteredNavigation.filter(item => item.section === sectionKey);
              if (sectionItems.length === 0) return null;

              return (
                <div key={sectionKey} className="space-y-1">
                  {!isCollapsed && (
                    <h3 className="px-3 text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 flex items-center">
                      <div className="w-4 h-0.5 bg-gradient-to-r from-blue-400 to-transparent mr-2"></div>
                      {sectionName}
                    </h3>
                  )}
                  {sectionItems.map((item) => {
                    const Icon = isActive(item.href) ? item.iconSolid : item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => {
                          if (onClose) onClose();
                        }}
                        className={`
                          group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl
                          transition-all duration-200 transform hover:scale-[1.02]
                          ${
                            active
                              ? 'bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 text-white shadow-lg shadow-blue-500/20 border border-white/20'
                              : 'text-blue-100 hover:bg-white/10 hover:text-white border border-transparent'
                          }
                        `}
                        title={isCollapsed ? item.name : undefined}
                      >
                        {/* Active indicator */}
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 via-purple-500 to-pink-500 rounded-r-full"></div>
                        )}
                        
                        {/* Icon with glow effect */}
                        <div className={`
                          relative flex items-center justify-center
                          ${isCollapsed ? 'w-full' : ''}
                        `}>
                          <div className={`
                            relative w-8 h-8 flex items-center justify-center rounded-lg
                            transition-all duration-200
                            ${active 
                              ? 'bg-white/20 shadow-lg' 
                              : 'group-hover:bg-white/10'
                            }
                          `}>
                            <Icon className={`
                              w-5 h-5 transition-all duration-200
                              ${active ? 'text-white scale-110' : 'text-blue-300 group-hover:text-white group-hover:scale-110'}
                            `} />
                          </div>
                        </div>
                        
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 ml-3 truncate">{item.name}</span>
                            
                            {/* Badge */}
                            {item.badge && item.badge > 0 && (
                              <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-2 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-pulse">
                                {item.badge}
                              </span>
                            )}
                            
                            {/* Active pulse dot */}
                            {active && (
                              <div className="ml-auto">
                                <div className="relative">
                                  <div className="w-2 h-2 bg-white rounded-full animate-ping absolute"></div>
                                  <div className="w-2 h-2 bg-white rounded-full relative"></div>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Hover shine effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity"></div>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="relative p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <button
              onClick={handleLogout}
              className={`
                w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl
                bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30
                text-red-300 hover:text-white border border-red-500/30 hover:border-red-400/50
                transition-all duration-200 transform hover:scale-[1.02]
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Logout' : undefined}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              {!isCollapsed && <span className="ml-3">Logout</span>}
            </button>
          </div>

          {/* Footer */}
          {!isCollapsed && (
            <div className="relative px-4 py-3 border-t border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="text-xs text-blue-300 space-y-1">
                <p className="font-semibold text-white flex items-center">
                  <SparklesIcon className="w-3 h-3 mr-1" />
                  Tracksy Admin
                </p>
                <p className="text-blue-400">Version 2.0.0</p>
                <p className="text-blue-500">© 2025 All rights reserved</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
