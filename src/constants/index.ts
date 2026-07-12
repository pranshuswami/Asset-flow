import type {
  ActivityType,
  AssetCategory,
  AssetCondition,
  AssetLifecycle,
  AuditStatus,
  BookingStatus,
  MaintenancePriority,
  MaintenanceStatus,
  NotificationType,
  Role,
  TransferStatus,
} from "@/types";

export const ROLES: { value: Role; label: string; description: string }[] = [
  { value: "ADMIN", label: "Admin", description: "Full platform control" },
  { value: "ASSET_MANAGER", label: "Asset Manager", description: "Manage assets & workflows" },
  { value: "DEPARTMENT_HEAD", label: "Department Head", description: "Manage department assets" },
  { value: "EMPLOYEE", label: "Employee", description: "Request & use assets" },
];

export const ASSET_STATUS_META: Record<
  AssetLifecycle,
  { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" | "accent" | "muted" }
> = {
  AVAILABLE: { label: "Available", variant: "success" },
  ALLOCATED: { label: "Allocated", variant: "default" },
  RESERVED: { label: "Reserved", variant: "accent" },
  MAINTENANCE: { label: "Maintenance", variant: "warning" },
  LOST: { label: "Lost", variant: "destructive" },
  DISPOSED: { label: "Disposed", variant: "muted" },
  RETIRED: { label: "Retired", variant: "muted" },
};

export const ASSET_CATEGORY_META: Record<AssetCategory, { label: string }> = {
  ELECTRONICS: { label: "Electronics" },
  VEHICLES: { label: "Vehicles" },
  FURNITURE: { label: "Furniture" },
  IT_EQUIPMENT: { label: "IT Equipment" },
  MEDICAL: { label: "Medical" },
  DOCUMENTS: { label: "Documents" },
};

export const ASSET_CONDITION_META: Record<
  AssetCondition,
  { label: string; variant: "success" | "default" | "warning" | "destructive" | "accent" }
> = {
  EXCELLENT: { label: "Excellent", variant: "success" },
  GOOD: { label: "Good", variant: "default" },
  FAIR: { label: "Fair", variant: "warning" },
  POOR: { label: "Poor", variant: "warning" },
  DAMAGED: { label: "Damaged", variant: "destructive" },
};

export const TRANSFER_STATUS_META: Record<
  TransferStatus,
  { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" | "accent" }
> = {
  REQUESTED: { label: "Requested", variant: "warning" },
  APPROVED: { label: "Approved", variant: "default" },
  TRANSFERRED: { label: "Transferred", variant: "success" },
  RETURNED: { label: "Returned", variant: "secondary" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" | "accent" }
> = {
  CONFIRMED: { label: "Confirmed", variant: "success" },
  PENDING: { label: "Pending", variant: "warning" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  CHECKED_IN: { label: "Checked In", variant: "default" },
};

export const MAINTENANCE_STATUS_META: Record<
  MaintenanceStatus,
  { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" | "accent" }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  APPROVED: { label: "Approved", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  IN_PROGRESS: { label: "In Progress", variant: "accent" },
  RESOLVED: { label: "Resolved", variant: "success" },
};

export const MAINTENANCE_PRIORITY_META: Record<
  MaintenancePriority,
  { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" | "accent" }
> = {
  LOW: { label: "Low", variant: "secondary" },
  MEDIUM: { label: "Medium", variant: "default" },
  HIGH: { label: "High", variant: "warning" },
  CRITICAL: { label: "Critical", variant: "destructive" },
};

export const AUDIT_STATUS_META: Record<
  AuditStatus,
  { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" | "accent" | "muted" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "accent" },
  COMPLETED: { label: "Completed", variant: "default" },
  CLOSED: { label: "Closed", variant: "muted" },
};

export const ACTIVITY_META: Record<ActivityType, { label: string; verb: string }> = {
  CREATED: { label: "Created", verb: "created" },
  ALLOCATED: { label: "Allocated", verb: "allocated" },
  TRANSFERRED: { label: "Transferred", verb: "transferred" },
  MAINTENANCE_REQUESTED: { label: "Maintenance", verb: "requested maintenance for" },
  MAINTENANCE_COMPLETED: { label: "Fixed", verb: "completed maintenance for" },
  AUDITED: { label: "Audited", verb: "audited" },
  RETURNED: { label: "Returned", verb: "returned" },
  DISPOSED: { label: "Disposed", verb: "disposed" },
  RESERVED: { label: "Reserved", verb: "reserved" },
  UPDATED: { label: "Updated", verb: "updated" },
};

export const NOTIFICATION_META: Record<
  NotificationType,
  { label: string }
> = {
  ASSET_ASSIGNED: { label: "Asset Assigned" },
  TRANSFER_APPROVED: { label: "Transfer Approved" },
  BOOKING_REMINDER: { label: "Booking Reminder" },
  MAINTENANCE_APPROVED: { label: "Maintenance Approved" },
  AUDIT_STARTED: { label: "Audit Started" },
  ASSET_RETURNED: { label: "Asset Returned" },
  OVERDUE_RETURN: { label: "Overdue Return" },
  INSIGHT: { label: "Insight" },
  MENTION: { label: "Mention" },
};

export const DEPARTMENT_COLORS = [
  "#6d5efc",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
];
