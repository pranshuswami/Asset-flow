import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  organizationName: z.string().min(1),
});

export const createAssetSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string(),
  departmentId: z.string(),
  locationId: z.string(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  warrantyExpiry: z.string().datetime().optional(),
  supplier: z.string().optional(),
  purchaseCost: z.number().optional(),
});

export const createAllocationSchema = z.object({
  assetId: z.string(),
  employeeId: z.string(),
  notes: z.string().optional(),
  conditionAtAllocation: z.string().optional(),
});

export const createBookingSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assetId: z.string().optional(),
  locationId: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  isRecurring: z.boolean().optional(),
  recurrence: z.string().optional(),
});

export const createMaintenanceSchema = z.object({
  assetId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  assignedToId: z.string().optional(),
});

export const createAuditSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  departmentId: z.string(),
  auditorId: z.string(),
});

export const updateAssetSchema = createAssetSchema.partial().extend({
  currentStatus: z
    .enum(["AVAILABLE", "ALLOCATED", "RESERVED", "MAINTENANCE", "LOST", "DISPOSED", "RETIRED"])
    .optional(),
  condition: z.enum(["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"]).optional(),
  lifecycle: z.enum(["ACTIVE", "INACTIVE", "DISPOSED"]).optional(),
  healthScore: z.number().int().min(0).max(100).optional(),
});

export const addTimelineEventSchema = z.object({
  type: z.enum([
    "CREATED",
    "ALLOCATED",
    "TRANSFERRED",
    "MAINTENANCE_REQUESTED",
    "MAINTENANCE_COMPLETED",
    "AUDITED",
    "RETURNED",
    "DISPOSED",
    "BOOKED",
  ]),
  description: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

export const allocationActionSchema = z.object({
  notes: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export const aiChatSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
});
