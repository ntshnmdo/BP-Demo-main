'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/authStore';
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Zap,
  ChevronLeft,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Create New Battery Passport',
    href: '/passports/new',
    icon: PlusCircle,
  },
  {
    label: 'View Batteries',
    href: '/passports',
    icon: List,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-slate-900 border-r border-slate-700/50 transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
        <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-semibold text-sm leading-tight">Battery Passport</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'ml-auto flex-shrink-0 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all',
            collapsed && 'mx-auto',
          )}
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive(item.href)
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="flex-1">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      {!collapsed && user && (
        <div className="px-4 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-slate-200 text-sm font-medium truncate">{user.name}</p>
              <p className="text-slate-500 text-xs truncate capitalize">
                {user.role.replace(/_/g, ' ').toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
