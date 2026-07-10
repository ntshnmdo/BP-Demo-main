'use client';

import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  ShieldCheck,
  Award,
  Battery,
  Zap,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PassportsByStatusChart } from '@/components/dashboard/PassportsByStatusChart';
import { CompletionTrendChart } from '@/components/dashboard/CompletionTrendChart';
import { RecentPassportsTable } from '@/components/dashboard/RecentPassportsTable';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines';
import { useDashboardStats } from '@/lib/hooks/useDashboard';
import { useAuthStore } from '@/lib/store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useDashboardStats();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Battery Passport Platform · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">Live Data</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Passports"
          value={stats?.total ?? 0}
          change={stats?.totalChange}
          icon={Battery}
          color="emerald"
          loading={isLoading}
        />
        <StatsCard
          title="Published"
          value={stats?.published ?? 0}
          change={stats?.publishedChange}
          icon={Zap}
          color="emerald"
          loading={isLoading}
        />
        <StatsCard
          title="In Progress"
          value={stats?.inProgress ?? 0}
          change={stats?.inProgressChange}
          icon={LayoutDashboard}
          color="blue"
          loading={isLoading}
        />
        <StatsCard
          title="Pending Approval"
          value={stats?.pendingApproval ?? 0}
          change={stats?.pendingChange}
          icon={ClipboardList}
          color="amber"
          loading={isLoading}
        />
        <StatsCard
          title="Rejected"
          value={stats?.rejected ?? 0}
          change={stats?.rejectedChange}
          icon={FileText}
          color="red"
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CompletionTrendChart />
        </div>
        <div>
          <PassportsByStatusChart />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Passports Table - takes 2 cols */}
        <div className="xl:col-span-2">
          <RecentPassportsTable />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          <QuickActions />
        </div>
      </div>

      {/* Activity & Deadlines Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivity />
        <UpcomingDeadlines />
      </div>
    </div>
  );
}
