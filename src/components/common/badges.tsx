import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  ASSET_STATUS_META,
  ASSET_CONDITION_META,
  TRANSFER_STATUS_META,
  BOOKING_STATUS_META,
  MAINTENANCE_STATUS_META,
  MAINTENANCE_PRIORITY_META,
  AUDIT_STATUS_META,
} from "@/constants";
import type {
  AssetCondition,
  AssetLifecycle,
  AuditStatus,
  BookingStatus,
  MaintenancePriority,
  MaintenanceStatus,
  TransferStatus,
} from "@/types";

function variant(v: BadgeProps["variant"]) {
  return v as BadgeProps["variant"];
}

export function StatusBadge({ status }: { status: AssetLifecycle }) {
  const m = ASSET_STATUS_META[status];
  return <Badge variant={variant(m.variant)}>{m.label}</Badge>;
}

export function ConditionBadge({ condition }: { condition: AssetCondition }) {
  const m = ASSET_CONDITION_META[condition];
  return <Badge variant={variant(m.variant)}>{m.label}</Badge>;
}

export function TransferBadge({ status }: { status: TransferStatus }) {
  const m = TRANSFER_STATUS_META[status];
  return <Badge variant={variant(m.variant)}>{m.label}</Badge>;
}

export function BookingBadge({ status }: { status: BookingStatus }) {
  const m = BOOKING_STATUS_META[status];
  return <Badge variant={variant(m.variant)}>{m.label}</Badge>;
}

export function MaintenanceBadge({ status }: { status: MaintenanceStatus }) {
  const m = MAINTENANCE_STATUS_META[status];
  return <Badge variant={variant(m.variant)}>{m.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: MaintenancePriority }) {
  const m = MAINTENANCE_PRIORITY_META[priority];
  return <Badge variant={variant(m.variant)}>{m.label}</Badge>;
}

export function AuditBadge({ status }: { status: AuditStatus }) {
  const m = AUDIT_STATUS_META[status];
  return <Badge variant={variant(m.variant)}>{m.label}</Badge>;
}
