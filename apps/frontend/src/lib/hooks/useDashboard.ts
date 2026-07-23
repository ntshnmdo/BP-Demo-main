import { useQuery } from '@tanstack/react-query';
import {
  getStats,
  getTrend,
  getStatusDistribution,
  getRecentActivity,
  getUpcomingTasks,
  getComplianceOverview,
  getGhgEmissions,
  DashboardStats,
  TrendDataPoint,
  StatusDistribution,
  ActivityItem,
  UpcomingTask,
  ComplianceOverview,
  GhgDataPoint,
} from '@/lib/api/dashboard';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  trend: () => [...dashboardKeys.all, 'trend'] as const,
  statusDist: () => [...dashboardKeys.all, 'status-dist'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  tasks: () => [...dashboardKeys.all, 'tasks'] as const,
  compliance: () => [...dashboardKeys.all, 'compliance'] as const,
  ghg: () => [...dashboardKeys.all, 'ghg'] as const,
};

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(),
    queryFn: getStats,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useCompletionTrend() {
  return useQuery<TrendDataPoint[]>({
    queryKey: dashboardKeys.trend(),
    queryFn: getTrend,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStatusDistribution() {
  return useQuery<StatusDistribution[]>({
    queryKey: dashboardKeys.statusDist(),
    queryFn: getStatusDistribution,
    staleTime: 1000 * 60,
  });
}

export function useRecentActivity() {
  return useQuery<ActivityItem[]>({
    queryKey: dashboardKeys.activity(),
    queryFn: getRecentActivity,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useUpcomingTasks() {
  return useQuery<UpcomingTask[]>({
    queryKey: dashboardKeys.tasks(),
    queryFn: getUpcomingTasks,
    staleTime: 1000 * 60,
  });
}

export function useComplianceOverview() {
  return useQuery<ComplianceOverview>({
    queryKey: dashboardKeys.compliance(),
    queryFn: getComplianceOverview,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGhgEmissions() {
  return useQuery<GhgDataPoint[]>({
    queryKey: dashboardKeys.ghg(),
    queryFn: getGhgEmissions,
    staleTime: 1000 * 60 * 5,
  });
}
