// ─── Enums ────────────────────────────────────────────────────────────────────

export enum Role {
  ADMIN = 'ADMIN',
  MANUFACTURER = 'MANUFACTURER',
  MATERIAL_SUPPLIER = 'MATERIAL_SUPPLIER',
  TESTING_LABORATORY = 'TESTING_LABORATORY',
  SUSTAINABILITY_TEAM = 'SUSTAINABILITY_TEAM',
  PUBLIC_USER = 'PUBLIC_USER',
}

export enum PassportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
}

export enum BatteryType {
  EV = 'EV',
  INDUSTRIAL = 'INDUSTRIAL',
  STATIONARY = 'STATIONARY',
  OTHER = 'OTHER',
}

export enum AuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  organization?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

// ─── Battery Passport ─────────────────────────────────────────────────────────

export interface MaterialCompositionItem {
  material: string;
  percentage: number;
  origin: string;
  supplier?: string;
}

export interface LifecycleEvent {
  stage: 'MANUFACTURED' | 'SHIPPED' | 'INSTALLED' | 'IN_SERVICE' | 'END_OF_LIFE';
  date: string;
  location?: string;
  notes?: string;
}

export interface BatteryPassport {
  id: string;
  passportId: string;
  status: PassportStatus;

  // Battery Identification
  serialNumber: string;
  qrCode?: string;

  // Product Information
  model: string;
  batteryType: BatteryType;
  chemistry: string;
  productionDate: string;
  intendedUse?: string;
  capacity?: number;
  nominalVoltage?: number;
  countryOfOrigin?: string;

  // Material Information
  materialComposition?: MaterialCompositionItem[];

  // Carbon Information
  carbonFootprint?: number;
  ghgEmissions?: number;
  manufacturingSiteEmissions?: number;

  // Circularity
  recycledContent?: number;
  recyclingInfo?: string;
  circularityScore?: number;

  // Blockchain
  blockchainHash?: string;
  blockchainTx?: string;

  // Warranty
  warrantyStart?: string;
  warrantyEnd?: string;
  warrantyKm?: number;

  // Lifecycle
  lifecycleEvents?: LifecycleEvent[];

  // Workflow
  submittedAt?: string;
  approvedAt?: string;
  publishedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  // Relations
  createdById: string;
  createdBy?: AuthUser;
  approvedById?: string;
  approvedBy?: AuthUser;

  certificates?: Certificate[];
  documents?: Document[];
  auditLogs?: AuditLog[];

  createdAt: string;
  updatedAt: string;
}

// ─── Certificate ──────────────────────────────────────────────────────────────

export interface Certificate {
  id: string;
  passportId: string;
  type: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Document ─────────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  passportId: string;
  name: string;
  type: 'TEST_REPORT' | 'DECLARATION' | 'CERTIFICATE' | 'OTHER';
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: string;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  passportId: string;
  action: AuditAction;
  actorId: string;
  actor?: AuthUser;
  details?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
  published: number;
  rejected: number;
}

export interface ComplianceOverview {
  label: string;
  value: number;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
