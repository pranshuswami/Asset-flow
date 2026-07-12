"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiChatSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.allocationActionSchema = exports.addTimelineEventSchema = exports.updateAssetSchema = exports.createAuditSchema = exports.createMaintenanceSchema = exports.createBookingSchema = exports.createAllocationSchema = exports.createAssetSchema = exports.signupSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.signupSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    organizationName: zod_1.z.string().min(1),
});
exports.createAssetSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    categoryId: zod_1.z.string(),
    departmentId: zod_1.z.string(),
    locationId: zod_1.z.string(),
    serialNumber: zod_1.z.string().optional(),
    purchaseDate: zod_1.z.string().datetime().optional(),
    warrantyExpiry: zod_1.z.string().datetime().optional(),
    supplier: zod_1.z.string().optional(),
    purchaseCost: zod_1.z.number().optional(),
});
exports.createAllocationSchema = zod_1.z.object({
    assetId: zod_1.z.string(),
    employeeId: zod_1.z.string(),
    notes: zod_1.z.string().optional(),
    conditionAtAllocation: zod_1.z.string().optional(),
});
exports.createBookingSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    assetId: zod_1.z.string().optional(),
    locationId: zod_1.z.string().optional(),
    startTime: zod_1.z.string().datetime(),
    endTime: zod_1.z.string().datetime(),
    isRecurring: zod_1.z.boolean().optional(),
    recurrence: zod_1.z.string().optional(),
});
exports.createMaintenanceSchema = zod_1.z.object({
    assetId: zod_1.z.string(),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    assignedToId: zod_1.z.string().optional(),
});
exports.createAuditSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    departmentId: zod_1.z.string(),
    auditorId: zod_1.z.string(),
});
exports.updateAssetSchema = exports.createAssetSchema.partial().extend({
    currentStatus: zod_1.z
        .enum(["AVAILABLE", "ALLOCATED", "RESERVED", "MAINTENANCE", "LOST", "DISPOSED", "RETIRED"])
        .optional(),
    condition: zod_1.z.enum(["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"]).optional(),
    lifecycle: zod_1.z.enum(["ACTIVE", "INACTIVE", "DISPOSED"]).optional(),
    healthScore: zod_1.z.number().int().min(0).max(100).optional(),
});
exports.addTimelineEventSchema = zod_1.z.object({
    type: zod_1.z.enum([
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
    description: zod_1.z.string().min(1),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.allocationActionSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    password: zod_1.z.string().min(8),
});
exports.aiChatSchema = zod_1.z.object({
    message: zod_1.z.string().min(1),
    conversationId: zod_1.z.string().optional(),
});
//# sourceMappingURL=index.js.map