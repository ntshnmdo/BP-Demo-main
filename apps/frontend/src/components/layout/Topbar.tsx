'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  HelpCircle,
  Calendar,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const mockNotifications = [
  {
    id: '1',
    title: 'Passport Approved',
    message: 'BAT-2024-001 has been approved by the regulator',
    time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
    type: 'success',
  },
  {
    id: '2',
    title: 'Review Required',
    message: 'BAT-2024-002 is pending your review and approval',
    time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    type: 'warning',
  },
  {
    id: '3',
    title: 'Certificate Expiring',
    message: 'UN38.3 certificate for BAT-2024-003 expires in 7 days',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
    type: 'info',
  },
];

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close help modal when navigating to a new page
  useEffect(() => {
    setShowHelpModal(false);
  }, [pathname]);

  // Close help modal on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowHelpModal(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const notifTypeColor = (type: string) => {
    if (type === 'success') return 'bg-emerald-500';
    if (type === 'warning') return 'bg-amber-500';
    return 'bg-blue-500';
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-slate-900/80 border-b border-slate-800/50 backdrop-blur-sm z-20 flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Passport ID, Model, Serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-slate-800 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5">
        {/* Calendar */}
        <button
          onClick={() => router.push('/tasks')}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-200"
          title="Tasks & Schedule"
        >
          <Calendar className="w-4.5 h-4.5" />
        </button>

        {/* Help */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-200"
          title="Help & Documentation"
        >
          <HelpCircle className="w-4.5 h-4.5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className={cn(
              'relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-200',
              showNotifications && 'bg-slate-800 text-slate-200'
            )}
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 glass-card rounded-xl shadow-glass overflow-hidden z-50 animate-slide-up">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/30">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-200">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-700/20">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'p-4 hover:bg-slate-800/30 cursor-pointer transition-colors',
                      !notif.read && 'bg-emerald-500/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                          notifTypeColor(notif.type)
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium', notif.read ? 'text-slate-400' : 'text-slate-200')}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                        <p className="text-xs text-slate-600 mt-1">{formatRelativeTime(notif.time)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-slate-700/30 text-center">
                <button className="text-xs text-emerald-400 hover:text-emerald-300">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* System Settings */}
        <button
          onClick={() => router.push('/settings')}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-200"
          title="System Settings"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700/50 mx-1" />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className={cn(
              'flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all duration-200',
              showUserMenu && 'bg-slate-800'
            )}
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold uppercase">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-200 leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 leading-tight">{user?.role || 'USER'}</p>
            </div>
            <ChevronDown className={cn('w-3.5 h-3.5 text-slate-500 transition-transform', showUserMenu && 'rotate-180')} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 glass-card rounded-xl shadow-glass overflow-hidden z-50 animate-slide-up">
              <div className="px-4 py-3 border-b border-slate-700/30">
                <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
                  <User className="w-4 h-4" />
                  View Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
              <div className="border-t border-slate-700/30 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50" onClick={() => setShowHelpModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Help & Documentation</h3>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Navigation</p>
                <div className="space-y-2">
                  {[
                    { label: 'Dashboard', desc: 'Overview of all passports and stats', path: '/dashboard' },
                    { label: 'Create Passport', desc: 'Register a new battery passport', path: '/passports/new' },
                    { label: 'View Batteries', desc: 'Search, filter and manage passports', path: '/passports' },
                    { label: 'Tasks & Schedule', desc: 'View upcoming compliance tasks', path: '/tasks' },
                  ].map((item) => (
                    <button
                      key={item.path}
                      onClick={() => { router.push(item.path); setShowHelpModal(false); }}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 text-left transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-200">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-700/40 pt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Keyboard Shortcuts</p>
                <div className="space-y-2 text-xs">
                  {[
                    { key: 'N', desc: 'Create new passport' },
                    { key: 'V', desc: 'View all batteries' },
                    { key: 'D', desc: 'Go to dashboard' },
                  ].map((s) => (
                    <div key={s.key} className="flex items-center justify-between">
                      <span className="text-slate-400">{s.desc}</span>
                      <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">Alt + {s.key}</kbd>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-700/40 pt-4 text-center">
                <p className="text-xs text-slate-500">EU Battery Regulation (2023/1542) compliant platform</p>
                <p className="text-xs text-slate-600 mt-1">v1.0.0 · support@batterypassport.eu</p>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
