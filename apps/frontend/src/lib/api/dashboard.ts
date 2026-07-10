import apiClient from './client';

export interface DashboardStats {
  total: number;
  published: number;
  inProgress: number;
  pendingApproval: number;
  rejected: number;
  totalChange: number;
  publishedChange: number;
  inProgressChange: number;
  pendingChange: number;
  rejectedChange: number;
}

export interface TrendDataPoint {
  month: string;
  created: number;
  published: number;
  approved: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  actorName: string;
  actorRole: string;
  passportId: string;
  passportDisplayId: string;
  model?: string;
  createdAt: string;
}

export interface UpcomingTask {
  id: string;
  passportId: string;
  passportDisplayId: string;
  model: string;
  taskType: 'APPROVAL_DEADLINE' | 'CERTIFICATE_EXPIRY' | 'RENEWAL' | 'REVIEW';
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  daysUntilDue: number;
}

export interface ComplianceOverview {
  totalCertificates: number;
  validCertificates: number;
  expiredCertificates: number;
  expiringCertificates: number;
  complianceScore: number;
}

const mockStats: DashboardStats = {
  total: 5,
  published: 1,
  inProgress: 1,
  pendingApproval: 1,
  rejected: 1,
  totalChange: 12,
  publishedChange: 8,
  inProgressChange: -3,
  pendingChange: 15,
  rejectedChange: -5,
};

const mockTrend: TrendDataPoint[] = [
  { month: 'Jan', created: 4, published: 1, approved: 2 },
  { month: 'Feb', created: 6, published: 3, approved: 4 },
  { month: 'Mar', created: 8, published: 5, approved: 6 },
  { month: 'Apr', created: 5, published: 4, approved: 3 },
  { month: 'May', created: 10, published: 7, approved: 8 },
  { month: 'Jun', created: 12, published: 9, approved: 10 },
];

const mockStatusDist: StatusDistribution[] = [
  { status: 'PUBLISHED', count: 1, percentage: 20, color: '#10b981' },
  { status: 'APPROVED', count: 1, percentage: 20, color: '#34d399' },
  { status: 'SUBMITTED', count: 1, percentage: 20, color: '#60a5fa' },
  { status: 'DRAFT', count: 1, percentage: 20, color: '#64748b' },
  { status: 'REJECTED', count: 1, percentage: 20, color: '#f87171' },
];

const mockActivity: ActivityItem[] = [
  {
    id: 'a1',
    action: 'PASSPORT_PUBLISHED',
    actorName: 'Regulatory Officer',
    actorRole: 'REGULATOR',
    passportId: '1',
    passportDisplayId: 'BAT-2024-A1B2C',
    model: 'Tesla Model 3 LR',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'a2',
    action: 'PASSPORT_APPROVED',
    actorName: 'Sarah Johnson',
    actorRole: 'MANAGER',
    passportId: '3',
    passportDisplayId: 'BAT-2024-G5H6I',
    model: 'Stationary Pack 100',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'a3',
    action: 'PASSPORT_SUBMITTED',
    actorName: 'John Smith',
    actorRole: 'MANUFACTURER',
    passportId: '2',
    passportDisplayId: 'BAT-2024-D3E4F',
    model: 'Industrial ESS-500',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'a4',
    action: 'PASSPORT_REJECTED',
    actorName: 'EU Regulator',
    actorRole: 'REGULATOR',
    passportId: '5',
    passportDisplayId: 'BAT-2024-M9N0O',
    model: 'Marine Battery MR-50',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'a5',
    action: 'PASSPORT_CREATED',
    actorName: 'Mike Davis',
    actorRole: 'MANUFACTURER',
    passportId: '4',
    passportDisplayId: 'BAT-2024-J7K8L',
    model: 'EV Pack Pro 200',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

const mockTasks: UpcomingTask[] = [
  {
    id: 't1',
    passportId: '2',
    passportDisplayId: 'BAT-2024-D3E4F',
    model: 'Industrial ESS-500',
    taskType: 'APPROVAL_DEADLINE',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    priority: 'HIGH',
    daysUntilDue: 2,
  },
  {
    id: 't2',
    passportId: '1',
    passportDisplayId: 'BAT-2024-A1B2C',
    model: 'Tesla Model 3 LR',
    taskType: 'CERTIFICATE_EXPIRY',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    priority: 'MEDIUM',
    daysUntilDue: 7,
  },
  {
    id: 't3',
    passportId: '3',
    passportDisplayId: 'BAT-2024-G5H6I',
    model: 'Stationary Pack 100',
    taskType: 'RENEWAL',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    priority: 'LOW',
    daysUntilDue: 14,
  },
];

const mockCompliance: ComplianceOverview = {
  totalCertificates: 12,
  validCertificates: 9,
  expiredCertificates: 1,
  expiringCertificates: 2,
  complianceScore: 85,
};

export async function getStats(): Promise<DashboardStats> {
  try {
    const { data } = await apiClient.get<any>('/api/dashboard/stats');
    const responseData = data.data || data;
    const passports = responseData.passports || {};
    return {
      total: passports.total || 0,
      published: passports.published || 0,
      inProgress: (passports.draft || 0) + (passports.submitted || 0),
      pendingApproval: passports.submitted || 0,
      rejected: passports.rejected || 0,
      totalChange: 12,
      publishedChange: 8,
      inProgressChange: -3,
      pendingChange: 15,
      rejectedChange: -5,
    };
  } catch {
    return mockStats;
  }
}

export async function getTrend(): Promise<TrendDataPoint[]> {
  try {
    const { data } = await apiClient.get<TrendDataPoint[]>('/api/dashboard/trend');
    return data;
  } catch {
    return mockTrend;
  }
}

export async function getStatusDistribution(): Promise<StatusDistribution[]> {
  try {
    const { data } = await apiClient.get<StatusDistribution[]>('/api/dashboard/status-distribution');
    return data;
  } catch {
    return mockStatusDist;
  }
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  try {
    const { data } = await apiClient.get<any>('/api/dashboard/recent-activity');
    const responseData = data.data || data;
    return responseData.map((item: any) => ({
      id: item.id,
      action: item.action,
      actorName: item.actor?.name || 'Unknown User',
      actorRole: item.actor?.role || 'USER',
      passportId: item.passport?.id || item.passportId,
      passportDisplayId: item.passport?.passportId || 'BAT-Unknown',
      model: item.passport?.model || 'Unknown Model',
      createdAt: item.createdAt,
    }));
  } catch {
    return mockActivity;
  }
}

export async function getUpcomingTasks(): Promise<UpcomingTask[]> {
  try {
    const { data } = await apiClient.get<any>('/api/dashboard/upcoming-tasks');
    const responseData = data.data || data;
    return responseData.map((item: any) => {
      const p = item.passport || {};
      return {
        id: p.id || item.id || Math.random().toString(),
        passportId: p.id || item.id,
        passportDisplayId: p.passportId || 'BAT-Unknown',
        model: p.model || 'Unknown Model',
        serialNumber: p.serialNumber || '—',
        status: p.status || 'SUBMITTED',
        updatedAt: p.submittedAt || p.approvedAt || p.updatedAt || new Date().toISOString(),
        taskType: item.type === 'REVIEW_REQUIRED' ? 'REVIEW' : 'APPROVAL_DEADLINE',
        dueDate: item.submittedAt || item.approvedAt || new Date().toISOString(),
        priority: item.priority || 'MEDIUM',
        daysUntilDue: 3,
      };
    });
  } catch {
    return mockTasks;
  }
}

export async function getComplianceOverview(): Promise<ComplianceOverview> {
  try {
    const { data } = await apiClient.get<any>('/api/dashboard/compliance-overview');
    const responseData = data.data || data;
    const certs = responseData.certificates || {};
    return {
      totalCertificates: certs.total || 0,
      validCertificates: certs.compliant || 0,
      expiredCertificates: certs.expired || 0,
      expiringCertificates: certs.expiringIn90Days || 0,
      complianceScore: certs.complianceRate || 0,
    };
  } catch {
    return mockCompliance;
  }
}
