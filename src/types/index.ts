// ============================================================================
// AssetFlow AI — Core Domain Types
// ============================================================================

export type Role = "ADMIN" | "ASSET_MANAGER" | "DEPARTMENT_HEAD" | "EMPLOYEE";

export type AssetLifecycle =
  | "AVAILABLE"
  | "ALLOCATED"
  | "RESERVED"
  | "MAINTENANCE"
  | "LOST"
  | "DISPOSED"
  | "RETIRED";

export type AssetCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "DAMAGED";

export type AssetCategory =
  | "ELECTRONICS"
  | "VEHICLES"
  | "FURNITURE"
  | "IT_EQUIPMENT"
  | "MEDICAL"
  | "DOCUMENTS";

export type TransferStatus =
  | "REQUESTED"
  | "APPROVED"
  | "TRANSFERRED"
  | "RETURNED"
  | "REJECTED";

export type BookingStatus = "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED" | "CHECKED_IN";

export type MaintenanceStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "RESOLVED";

export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AuditStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";

export type NotificationType =
  | "ASSET_ASSIGNED"
  | "TRANSFER_APPROVED"
  | "BOOKING_REMINDER"
  | "MAINTENANCE_APPROVED"
  | "AUDIT_STARTED"
  | "ASSET_RETURNED"
  | "OVERDUE_RETURN"
  | "INSIGHT"
  | "MENTION";

export type ActivityType =
  | "CREATED"
  | "ALLOCATED"
  | "TRANSFERRED"
  | "MAINTENANCE_REQUESTED"
  | "MAINTENANCE_COMPLETED"
  | "AUDITED"
  | "RETURNED"
  | "DISPOSED"
  | "RESERVED"
  | "UPDATED";

// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  departmentId: string;
  title: string;
  phone?: string;
  status: "ACTIVE" | "INVITED" | "DISABLED";
  createdAt: string;
  lastActive: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headId?: string;
  parentId?: string;
  status: "ACTIVE" | "INACTIVE";
  budget: number;
  memberCount: number;
  color: string;
}

export interface Location {
  id: string;
  building: string;
  floor: string;
  room: string;
  campus: string;
}

export interface AssetTimelineEvent {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  actor: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  assetId: string;
  name: string;
  category: AssetCategory;
  serialNumber: string;
  model?: string;
  photo?: string;
  status: AssetLifecycle;
  condition: AssetCondition;
  ownerId?: string;
  departmentId: string;
  locationId: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiry?: string;
  supplier?: string;
  healthScore: number;
  riskScore: number;
  nextServiceDate?: string;
  utilization: number;
  lastUsed?: string;
  createdAt: string;
  timeline: AssetTimelineEvent[];
  documents: { id: string; name: string; url: string; size: number }[];
}

export interface Allocation {
  id: string;
  assetId: string;
  fromUserId?: string;
  toUserId: string;
  departmentId: string;
  status: TransferStatus;
  reason?: string;
  condition: AssetCondition;
  requestedBy: string;
  approvedBy?: string;
  requestedAt: string;
  transferredAt?: string;
  returnedAt?: string;
  expectedReturn?: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: "ROOM" | "VEHICLE" | "PROJECTOR" | "EQUIPMENT";
  userId: string;
  title: string;
  start: string;
  end: string;
  status: BookingStatus;
  recurring: boolean;
  attendees: string[];
}

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  assetName: string;
  raisedBy: string;
  technician?: string;
  priority: MaintenancePriority;
  issue: string;
  status: MaintenanceStatus;
  cost?: number;
  photos: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditItem {
  assetId: string;
  status: "VERIFIED" | "MISSING" | "DAMAGED" | "PENDING";
  note?: string;
  verifiedBy?: string;
}

export interface Audit {
  id: string;
  title: string;
  status: AuditStatus;
  auditorIds: string[];
  departmentIds: string[];
  assetIds: string[];
  items: AuditItem[];
  progress: number;
  createdAt: string;
  closedAt?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  href?: string;
  actor?: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical" | "positive";
  metric?: string;
  delta?: number;
  recommendation?: string;
  createdAt: string;
}

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  actor: string;
  actorAvatar?: string;
  target: string;
  summary: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsed?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardMetrics {
  totalAssets: number;
  available: number;
  allocated: number;
  maintenance: number;
  bookings: number;
  transfers: number;
  utilization: number;
  utilizationDelta: number;
  utilizationTrend: number[];
  categoryBreakdown: { category: AssetCategory; count: number }[];
  departmentRanking: { departmentId: string; name: string; utilization: number; assets: number }[];
  monthlyBookings: { month: string; bookings: number; allocations: number }[];
  healthDistribution: { range: string; count: number }[];
}
