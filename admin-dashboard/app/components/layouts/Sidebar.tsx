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
  MegaphoneIcon,
  Bars3Icon,
  ChevronDownIcon,
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
  MegaphoneIcon as MegaphoneIconSolid,
} from '@heroicons/react/24/solid';
import { useAuthStore } from '../../lib/store/authStore';
import { hasPermission, PERMISSIONS } from '../../lib/utils/permissions';
import { useLanguage } from '../../lib/i18n/LanguageProvider';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    main: true,
    fleet: true,
    users: false,
    operations: false,
    financial: false,
    insights: false,
    system: false,
  });

  const navigation = [
    {
      name: t('navDashboard'),
      href: '/dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      permission: PERMISSIONS.ANALYTICS_VIEW,
      badge: null,
      section: 'main',
    },
    {
      name: t('navBuses'),
      href: '/buses',
      icon: TruckIcon,
      iconSolid: TruckIconSolid,
      permission: PERMISSIONS.BUSES_VIEW,
      badge: null,
      section: 'fleet',
    },
    {
      name: t('navRoutes'),
      href: '/routes',
      icon: MapIcon,
      iconSolid: MapIconSolid,
      permission: PERMISSIONS.ROUTES_VIEW,
      badge: null,
      section: 'fleet',
    },
    {
      name: t('navStops'),
      href: '/stops',
      icon: MapPinIcon,
      iconSolid: MapPinIconSolid,
      permission: PERMISSIONS.ROUTES_VIEW,
      badge: null,
      section: 'fleet',
    },
    {
      name: t('navLiveMap'),
      href: '/live-map',
      icon: MapIcon,
      iconSolid: MapIconSolid,
      permission: PERMISSIONS.BUSES_VIEW,
      badge: null,
      section: 'fleet',
    },
    {
      name: t('navStudents'),
      href: '/students',
      icon: UserGroupIcon,
      iconSolid: UserGroupIconSolid,
      permission: PERMISSIONS.USERS_VIEW,
      badge: null,
      section: 'users',
    },
    {
      name: t('navDrivers'),
      href: '/drivers',
      icon: UserIcon,
      iconSolid: UserIconSolid,
      permission: PERMISSIONS.USERS_VIEW,
      badge: null,
      section: 'users',
    },
    {
      name: t('navAdmins'),
      href: '/admins',
      icon: UserIcon,
      iconSolid: UserIconSolid,
      permission: PERMISSIONS.USERS_VIEW,
      badge: null,
      section: 'users',
    },
    {
      name: t('navTrips'),
      href: '/trips',
      icon: MapPinIcon,
      iconSolid: MapPinIconSolid,
      permission: PERMISSIONS.BUSES_VIEW,
      badge: null,
      section: 'operations',
    },
    {
      name: t('navBookings'),
      href: '/bookings',
      icon: TicketIcon,
      iconSolid: TicketIconSolid,
      permission: PERMISSIONS.USERS_VIEW,
      badge: null,
      section: 'operations',
    },
    {
      name: t('navAnalytics'),
      href: '/analytics',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
      permission: PERMISSIONS.ANALYTICS_VIEW,
      badge: null,
      section: 'insights',
    },
    {
      name: t('navFees'),
      href: '/fees',
      icon: BanknotesIcon,
      iconSolid: BanknotesIconSolid,
      permission: PERMISSIONS.USERS_VIEW,
      badge: null,
      section: 'financial',
    },
    {
      name: t('navInvoices'),
      href: '/fees/invoices',
      icon: ReceiptPercentIcon,
      iconSolid: ReceiptPercentIconSolid,
      permission: PERMISSIONS.USERS_VIEW,
      badge: null,
      section: 'financial',
    },
    {
      name: t('navReports'),
      href: '/reports',
      icon: DocumentTextIcon,
      iconSolid: DocumentTextIconSolid,
      permission: PERMISSIONS.REPORTS_VIEW,
      badge: null,
      section: 'insights',
    },
    {
      name: t('navAlerts'),
      href: '/alerts',
      icon: BellAlertIcon,
      iconSolid: BellAlertIconSolid,
      permission: PERMISSIONS.ALERTS_VIEW,
      badge: 5,
      section: 'system',
    },
    {
      name: t('navAnnouncements'),
      href: '/notifications/new',
      icon: MegaphoneIcon,
      iconSolid: MegaphoneIconSolid,
      permission: PERMISSIONS.ALERTS_MANAGE,
      badge: null,
      section: 'system',
    },
    {
      name: t('navMaintenance'),
      href: '/maintenance',
      icon: WrenchScrewdriverIcon,
      iconSolid: WrenchScrewdriverIconSolid,
      permission: PERMISSIONS.BUSES_VIEW,
      badge: 2,
      section: 'system',
    },
    {
      name: t('navSettings'),
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
  const navigationItems = filteredNavigation.length > 0 ? filteredNavigation : navigation;

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
          flex-shrink-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-2xl border-r border-white/10 ring-1 ring-white/10
        `}
      >
        <div className="flex flex-col h-full relative">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-fuchsia-500/20 opacity-70 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none"></div>
          <div className="absolute inset-0 backdrop-blur-3xl opacity-30 pointer-events-none"></div>

          {/* Logo Section */}
          <div className="relative flex items-center justify-between px-4 py-4 border-b border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-indigo-200 truncate">{user?.role || 'admin'}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
              aria-label="Toggle sidebar"
              aria-pressed={isCollapsed}
            >
              <Bars3Icon className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="relative flex-1 px-3 py-4 overflow-y-auto custom-scrollbar space-y-3">
            {isCollapsed
              ? navigationItems.map((item) => {
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
                        group relative flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg
                        transition-all duration-200
                        ${
                          active
                            ? 'bg-white text-indigo-900 shadow-md border border-white/60'
                            : 'text-indigo-100 hover:bg-white/10 hover:text-white border border-transparent'
                        }
                      `}
                      title={item.name}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-indigo-700' : 'text-indigo-200'}`} />
                    </Link>
                  );
                })
              : Object.entries(sections).map(([sectionKey, sectionName]) => {
                  const sectionItems = navigationItems.filter((item) => item.section === sectionKey);
                  if (sectionItems.length === 0) return null;

                  const isOpen = openSections[sectionKey] ?? true;

                  return (
                    <div key={sectionKey} className="space-y-1">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSections((prev) => ({
                            ...prev,
                            [sectionKey]: !isOpen,
                          }))
                        }
                        className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-200 hover:bg-white/5"
                      >
                        <span>{sectionName}</span>
                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                        />
                      </button>
                      {isOpen &&
                        sectionItems.map((item) => {
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
                                group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg
                                transition-all duration-200
                                ${
                                  active
                                    ? 'bg-white text-indigo-900 shadow-sm border border-white/60'
                                    : 'text-indigo-100 hover:bg-white/10 hover:text-white border border-transparent'
                                }
                              `}
                              title={item.name}
                            >
                              {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-indigo-500 via-purple-500 to-fuchsia-500 rounded-r-full"></div>
                              )}
                              <div className="flex items-center justify-center">
                                <div
                                  className={`w-7 h-7 flex items-center justify-center rounded-md ${
                                    active ? 'bg-indigo-100' : 'group-hover:bg-white/10'
                                  }`}
                                >
                                  <Icon className={`w-5 h-5 ${active ? 'text-indigo-700' : 'text-indigo-200'}`} />
                                </div>
                              </div>
                              <span className="flex-1 ml-3 truncate">{item.name}</span>
                              {item.badge && item.badge > 0 && (
                                <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-fuchsia-500 rounded-full shadow-lg">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                    </div>
                  );
                })}
          </nav>

          {/* Logout Button */}
          <div className="relative p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm space-y-3">
            {!isCollapsed && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wide mb-2">Quick Actions</p>
                <div className="grid grid-cols-1 gap-2">
                  <Link
                    to="/buses/new"
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-indigo-100 hover:bg-white/20 transition-all"
                  >
                    <TruckIcon className="h-4 w-4 text-indigo-100" />
                    Add New Bus
                  </Link>
                  <Link
                    to="/routes/new"
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-indigo-100 hover:bg-white/20 transition-all"
                  >
                    <MapIcon className="h-4 w-4 text-indigo-100" />
                    Create Route
                  </Link>
                  <Link
                    to="/bookings?status=pending"
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-indigo-100 hover:bg-white/20 transition-all"
                  >
                    <TicketIcon className="h-4 w-4 text-indigo-100" />
                    Review Bookings
                  </Link>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`
                w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl
                bg-gradient-to-r from-rose-500/20 to-fuchsia-500/20 hover:from-rose-500/30 hover:to-fuchsia-500/30
                text-rose-200 hover:text-white border border-rose-500/30 hover:border-rose-400/50
                transition-all duration-200 transform hover:scale-[1.02]
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? t('logout') : undefined}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              {!isCollapsed && <span className="ml-3">{t('logout')}</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
