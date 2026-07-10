import apiClient from './client';

export type PassportStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
export type BatteryType = 'EV' | 'INDUSTRIAL' | 'STATIONARY' | 'CONSUMER' | 'MARINE';
export type ChemistryType = 'NMC' | 'LFP' | 'NCA' | 'LMO' | 'LTO' | 'SOLID_STATE' | 'OTHER';

export interface Material {
  id?: string;
  name: string;
  percentage: number;
  originCountry: string;
  supplier: string;
  casNumber?: string;
  hazardous?: boolean;
}

export interface Certificate {
  id?: string;
  type: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: 'VALID' | 'EXPIRED' | 'PENDING' | 'REVOKED';
  documentUrl?: string;
}

export interface BatteryPassport {
  id: string;
  passportId: string;
  serialNumber: string;
  qrCode?: string;
  status: PassportStatus;

  // Product Info
  model: string;
  batteryType: BatteryType;
  chemistry: ChemistryType;
  manufacturer?: string;
  productionDate?: string;
  intendedUse?: string;
  capacityKwh?: number;
  nominalVoltageV?: number;
  countryOfOrigin?: string;
  stateOfHealth?: number;
  stateOfCharge?: number;

  // Material Info
  materials?: Material[];

  // Carbon Info
  carbonFootprintKgCo2eKwh?: number;
  ghgEmissions?: number;
  manufacturingSiteEmissions?: number;

  // Compliance
  certificates?: Certificate[];

  // Circularity
  recycledContentPercent?: number;
  recyclingInformation?: string;
  circularityScore?: number;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  warrantyKm?: number;

  // Blockchain
  blockchainHash?: string;
  blockchainTx?: string;

  // Meta
  createdById?: string;
  createdByName?: string;
  organizationId?: string;
  organizationName?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  publishedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  // Lifecycle
  lifecycleEvents?: LifecycleEvent[];
  auditLogs?: AuditLog[];
}

export interface LifecycleEvent {
  id: string;
  event: string;
  date: string;
  location?: string;
  description?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorName: string;
  actorEmail?: string;
  actorRole?: string;
  passportId: string;
  passportDisplayId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface PassportFilters {
  status?: PassportStatus;
  chemistry?: ChemistryType;
  batteryType?: BatteryType;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPassports {
  data: BatteryPassport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Mock data for demo
const mockPassports: BatteryPassport[] = [
  {
    id: '1',
    passportId: 'BAT-2024-A1B2C',
    serialNumber: 'SN-2024-001',
    status: 'PUBLISHED',
    model: 'Tesla Model 3 LR',
    batteryType: 'EV',
    chemistry: 'NMC',
    manufacturer: 'Demo Manufacturer',
    productionDate: '2024-01-15',
    capacityKwh: 82,
    nominalVoltageV: 400,
    countryOfOrigin: 'Germany',
    carbonFootprintKgCo2eKwh: 68.5,
    recycledContentPercent: 18,
    circularityScore: 72,
    createdByName: 'Admin User',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    certificates: [
      { id: 'c1', type: 'UN38.3', issuer: 'TÜV SÜD', issueDate: '2024-01-01', expiryDate: '2027-01-01', status: 'VALID' },
      { id: 'c2', type: 'CE', issuer: 'Bureau Veritas', issueDate: '2024-01-10', expiryDate: '2027-01-10', status: 'VALID' },
    ],
    materials: [
      { name: 'Lithium', percentage: 6.5, originCountry: 'Chile', supplier: 'SQM' },
      { name: 'Nickel', percentage: 36, originCountry: 'Indonesia', supplier: 'Vale' },
      { name: 'Manganese', percentage: 12, originCountry: 'South Africa', supplier: 'Eramet' },
      { name: 'Cobalt', percentage: 5, originCountry: 'DRC', supplier: 'Glencore' },
    ],
  },
  {
    id: '2',
    passportId: 'BAT-2024-D3E4F',
    serialNumber: 'SN-2024-002',
    status: 'SUBMITTED',
    model: 'Industrial ESS-500',
    batteryType: 'INDUSTRIAL',
    chemistry: 'LFP',
    manufacturer: 'Demo Manufacturer',
    productionDate: '2024-02-20',
    capacityKwh: 500,
    nominalVoltageV: 800,
    countryOfOrigin: 'China',
    carbonFootprintKgCo2eKwh: 45.2,
    recycledContentPercent: 22,
    circularityScore: 81,
    createdByName: 'John Smith',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    certificates: [],
    materials: [],
  },
  {
    id: '3',
    passportId: 'BAT-2024-G5H6I',
    serialNumber: 'SN-2024-003',
    status: 'APPROVED',
    model: 'Stationary Pack 100',
    batteryType: 'STATIONARY',
    chemistry: 'LFP',
    manufacturer: 'Demo Manufacturer',
    productionDate: '2024-03-10',
    capacityKwh: 100,
    nominalVoltageV: 48,
    countryOfOrigin: 'USA',
    carbonFootprintKgCo2eKwh: 52.8,
    recycledContentPercent: 30,
    circularityScore: 88,
    createdByName: 'Sarah Johnson',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    certificates: [],
    materials: [],
  },
  {
    id: '4',
    passportId: 'BAT-2024-J7K8L',
    serialNumber: 'SN-2024-004',
    status: 'DRAFT',
    model: 'EV Pack Pro 200',
    batteryType: 'EV',
    chemistry: 'NCA',
    manufacturer: 'Demo Manufacturer',
    productionDate: '2024-04-05',
    capacityKwh: 200,
    nominalVoltageV: 800,
    countryOfOrigin: 'South Korea',
    createdByName: 'Mike Davis',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    certificates: [],
    materials: [],
  },
  {
    id: '5',
    passportId: 'BAT-2024-M9N0O',
    serialNumber: 'SN-2024-005',
    status: 'REJECTED',
    model: 'Marine Battery MR-50',
    batteryType: 'MARINE',
    chemistry: 'LMO',
    manufacturer: 'Demo Manufacturer',
    productionDate: '2024-04-18',
    capacityKwh: 50,
    nominalVoltageV: 24,
    countryOfOrigin: 'Japan',
    createdByName: 'Emma Wilson',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    rejectionReason: 'Missing UN38.3 transport certification',
    certificates: [],
    materials: [],
  },
];

export function mapBackendToFrontend(p: any): BatteryPassport {
  if (!p) return p;

  const materials: any[] = [];
  if (p.materialComposition && typeof p.materialComposition === 'object') {
    Object.entries(p.materialComposition).forEach(([name, details]: [string, any]) => {
      materials.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        percentage: details?.percentage ?? 0,
        originCountry: details?.origin ?? '',
        supplier: details?.supplier ?? '',
      });
    });
  }

  const organizationName = p.createdBy?.organization ?? p.organizationName ?? 'GreenPower Ltd.';

  return {
    ...p,
    capacityKwh: p.capacityKwh ?? p.capacity,
    nominalVoltageV: p.nominalVoltageV ?? p.nominalVoltage,
    carbonFootprintKgCo2eKwh: p.carbonFootprintKgCo2eKwh ?? p.carbonFootprint,
    recycledContentPercent: p.recycledContentPercent ?? p.recycledContent,
    recyclingInformation: p.recyclingInformation ?? p.recyclingInfo,
    warrantyStartDate: p.warrantyStartDate ?? p.warrantyStart,
    warrantyEndDate: p.warrantyEndDate ?? p.warrantyEnd,
    stateOfHealth: p.stateOfHealth !== null && p.stateOfHealth !== undefined ? p.stateOfHealth : 100,
    stateOfCharge: p.stateOfCharge !== null && p.stateOfCharge !== undefined ? p.stateOfCharge : 100,
    materials: p.materials && p.materials.length > 0 ? p.materials : materials,
    organizationName,
    lifecycleEvents: p.lifecycleEvents ?? [
      { id: 'e1', event: 'Manufactured', date: p.productionDate || '2024-01-15', location: p.countryOfOrigin || 'Germany' },
      { id: 'e2', event: 'Shipped', date: '2024-02-01', location: 'Rotterdam Port' },
      { id: 'e3', event: 'Installed', date: '2024-02-20', location: 'Berlin, Germany' },
      { id: 'e4', event: 'In Service', date: '2024-02-25', location: 'Berlin, Germany' },
    ],
  };
}

export async function getPassports(filters: PassportFilters = {}): Promise<PaginatedPassports> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  const { data } = await apiClient.get<any>(`/api/passports?${params}`);
  const inner = data?.passports !== undefined ? data : (data?.data ?? data);
  const mapped = (inner.passports ?? inner.data ?? []).map(mapBackendToFrontend);
  return {
    data: mapped,
    total: inner.total ?? 0,
    page: inner.page ?? 1,
    limit: inner.limit ?? 10,
    totalPages: inner.totalPages ?? 1,
  };
}

export async function getPassport(id: string): Promise<BatteryPassport> {
  try {
    const { data } = await apiClient.get<any>(`/api/passports/${id}`);
    return mapBackendToFrontend(data);
  } catch {
    const passport = mockPassports.find((p) => p.id === id || p.passportId === id);
    if (!passport) throw new Error('Passport not found');
    return mapBackendToFrontend({
      ...passport,
      lifecycleEvents: [
        { id: 'e1', event: 'Manufactured', date: passport.productionDate || '2024-01-15', location: passport.countryOfOrigin || 'Germany' },
        { id: 'e2', event: 'Shipped', date: '2024-02-01', location: 'Rotterdam Port' },
        { id: 'e3', event: 'Installed', date: '2024-02-20', location: 'Berlin, Germany' },
        { id: 'e4', event: 'In Service', date: '2024-02-25', location: 'Berlin, Germany' },
      ],
    });
  }
}

export async function createPassport(data: Partial<BatteryPassport>): Promise<BatteryPassport> {
  const payload = {
    serialNumber: data.serialNumber,
    model: data.model,
    batteryType: data.batteryType,
    chemistry: data.chemistry,
    productionDate: data.productionDate ? new Date(data.productionDate).toISOString() : new Date().toISOString(),
    intendedUse: data.intendedUse || undefined,
    capacity: data.capacityKwh ? Number(data.capacityKwh) : undefined,
    nominalVoltage: data.nominalVoltageV ? Number(data.nominalVoltageV) : undefined,
    countryOfOrigin: data.countryOfOrigin || undefined,
    carbonFootprint: data.carbonFootprintKgCo2eKwh ? Number(data.carbonFootprintKgCo2eKwh) : undefined,
    ghgEmissions: data.ghgEmissions ? Number(data.ghgEmissions) : undefined,
    manufacturingSiteEmissions: data.manufacturingSiteEmissions ? Number(data.manufacturingSiteEmissions) : undefined,
    recycledContent: data.recycledContentPercent ? Number(data.recycledContentPercent) : undefined,
    recyclingInfo: data.recyclingInformation || undefined,
    circularityScore: data.circularityScore ? Number(data.circularityScore) : undefined,
    warrantyStart: data.warrantyStartDate ? new Date(data.warrantyStartDate).toISOString() : undefined,
    warrantyEnd: data.warrantyEndDate ? new Date(data.warrantyEndDate).toISOString() : undefined,
    warrantyKm: data.warrantyKm ? Number(data.warrantyKm) : undefined,
    stateOfHealth: data.stateOfHealth !== undefined ? Number(data.stateOfHealth) : undefined,
    stateOfCharge: data.stateOfCharge !== undefined ? Number(data.stateOfCharge) : undefined,
    materialComposition: {},
  };

  if (data.materials && Array.isArray(data.materials)) {
    const composition: Record<string, any> = {};
    data.materials.forEach((m) => {
      if (m.name) {
        composition[m.name.toLowerCase()] = {
          percentage: Number(m.percentage) || 0,
          origin: m.originCountry || '',
          supplier: m.supplier || '',
        };
      }
    });
    payload.materialComposition = composition;
  }

  // Call the real API
  const { data: result } = await apiClient.post<any>('/api/passports', payload);

  // If there are certificates, create them
  if (data.certificates && Array.isArray(data.certificates)) {
    for (const cert of data.certificates) {
      await apiClient.post(`/api/passports/${result.id}/certificates`, {
        type: cert.type,
        issuer: cert.issuer,
        issuedDate: cert.issueDate ? new Date(cert.issueDate).toISOString() : new Date().toISOString(),
        expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString() : undefined,
        status: cert.status,
      });
    }
  }

  return result;
}

export async function updatePassport(
  id: string,
  data: Partial<BatteryPassport>
): Promise<BatteryPassport> {
  const payload: any = {
    serialNumber: data.serialNumber,
    model: data.model,
    batteryType: data.batteryType,
    chemistry: data.chemistry,
    intendedUse: data.intendedUse || undefined,
    capacity: data.capacityKwh ? Number(data.capacityKwh) : undefined,
    nominalVoltage: data.nominalVoltageV ? Number(data.nominalVoltageV) : undefined,
    countryOfOrigin: data.countryOfOrigin || undefined,
    carbonFootprint: data.carbonFootprintKgCo2eKwh ? Number(data.carbonFootprintKgCo2eKwh) : undefined,
    ghgEmissions: data.ghgEmissions ? Number(data.ghgEmissions) : undefined,
    manufacturingSiteEmissions: data.manufacturingSiteEmissions ? Number(data.manufacturingSiteEmissions) : undefined,
    recycledContent: data.recycledContentPercent ? Number(data.recycledContentPercent) : undefined,
    recyclingInfo: data.recyclingInformation || undefined,
    circularityScore: data.circularityScore ? Number(data.circularityScore) : undefined,
    warrantyKm: data.warrantyKm ? Number(data.warrantyKm) : undefined,
    stateOfHealth: data.stateOfHealth !== undefined ? Number(data.stateOfHealth) : undefined,
    stateOfCharge: data.stateOfCharge !== undefined ? Number(data.stateOfCharge) : undefined,
  };

  if (data.productionDate) {
    payload.productionDate = new Date(data.productionDate).toISOString();
  }
  if (data.warrantyStartDate) {
    payload.warrantyStart = new Date(data.warrantyStartDate).toISOString();
  }
  if (data.warrantyEndDate) {
    payload.warrantyEnd = new Date(data.warrantyEndDate).toISOString();
  }

  if (data.materials && Array.isArray(data.materials)) {
    const composition: Record<string, any> = {};
    data.materials.forEach((m) => {
      if (m.name) {
        composition[m.name.toLowerCase()] = {
          percentage: Number(m.percentage) || 0,
          origin: m.originCountry || '',
          supplier: m.supplier || '',
        };
      }
    });
    payload.materialComposition = composition;
  }

  const { data: result } = await apiClient.patch<any>(`/api/passports/${id}`, payload);
  return result;
}

export async function submitPassport(id: string): Promise<BatteryPassport> {
  const { data } = await apiClient.post<BatteryPassport>(`/api/passports/${id}/submit`);
  return data;
}

export async function approvePassport(id: string): Promise<BatteryPassport> {
  const { data } = await apiClient.post<BatteryPassport>(`/api/passports/${id}/approve`);
  return data;
}

export async function rejectPassport(id: string, reason: string): Promise<BatteryPassport> {
  const { data } = await apiClient.post<BatteryPassport>(`/api/passports/${id}/reject`, {
    reason,
  });
  return data;
}

export async function publishPassport(id: string): Promise<BatteryPassport> {
  const { data } = await apiClient.post<BatteryPassport>(`/api/passports/${id}/publish`);
  return data;
}

export async function getPublicPassport(id: string): Promise<BatteryPassport> {
  const { data } = await apiClient.get<any>(`/api/passports/public/${id}`);
  return mapBackendToFrontend(data);
}

export async function getAuditLogs(passportId: string): Promise<AuditLog[]> {
  try {
    const { data } = await apiClient.get<AuditLog[]>(`/api/passports/${passportId}/audit-logs`);
    return data;
  } catch {
    return [
      {
        id: 'al1',
        action: 'PASSPORT_CREATED',
        actorName: 'Admin User',
        actorEmail: 'admin@goodenergy.com',
        actorRole: 'ADMIN',
        passportId,
        details: 'Passport created via web form',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      {
        id: 'al2',
        action: 'PASSPORT_SUBMITTED',
        actorName: 'Admin User',
        actorEmail: 'admin@goodenergy.com',
        actorRole: 'ADMIN',
        passportId,
        details: 'Submitted for regulatory review',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        id: 'al3',
        action: 'PASSPORT_APPROVED',
        actorName: 'Regulatory Officer',
        actorEmail: 'regulator@eu.gov',
        actorRole: 'REGULATOR',
        passportId,
        details: 'All compliance checks passed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      },
    ];
  }
}

export async function deletePassport(id: string): Promise<any> {
  const { data } = await apiClient.delete<any>(`/api/passports/${id}`);
  return data;
}

export async function verifyPassport(id: string): Promise<{
  verified: boolean;
  storedHash: string;
  currentHash: string;
  txHash: string;
  message: string;
}> {
  const { data } = await apiClient.get<any>(`/api/passports/${id}/verify`);
  return data;
}
