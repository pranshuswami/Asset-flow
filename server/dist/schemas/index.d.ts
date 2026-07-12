import { z } from "zod";
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const signupSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    organizationName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    organizationName: string;
}, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    organizationName: string;
}>;
export declare const createAssetSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodString;
    departmentId: z.ZodString;
    locationId: z.ZodString;
    serialNumber: z.ZodOptional<z.ZodString>;
    purchaseDate: z.ZodOptional<z.ZodString>;
    warrantyExpiry: z.ZodOptional<z.ZodString>;
    supplier: z.ZodOptional<z.ZodString>;
    purchaseCost: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    departmentId: string;
    categoryId: string;
    locationId: string;
    description?: string | undefined;
    serialNumber?: string | undefined;
    purchaseDate?: string | undefined;
    warrantyExpiry?: string | undefined;
    supplier?: string | undefined;
    purchaseCost?: number | undefined;
}, {
    name: string;
    departmentId: string;
    categoryId: string;
    locationId: string;
    description?: string | undefined;
    serialNumber?: string | undefined;
    purchaseDate?: string | undefined;
    warrantyExpiry?: string | undefined;
    supplier?: string | undefined;
    purchaseCost?: number | undefined;
}>;
export declare const createAllocationSchema: z.ZodObject<{
    assetId: z.ZodString;
    employeeId: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    conditionAtAllocation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    assetId: string;
    employeeId: string;
    notes?: string | undefined;
    conditionAtAllocation?: string | undefined;
}, {
    assetId: string;
    employeeId: string;
    notes?: string | undefined;
    conditionAtAllocation?: string | undefined;
}>;
export declare const createBookingSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    assetId: z.ZodOptional<z.ZodString>;
    locationId: z.ZodOptional<z.ZodString>;
    startTime: z.ZodString;
    endTime: z.ZodString;
    isRecurring: z.ZodOptional<z.ZodBoolean>;
    recurrence: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    startTime: string;
    endTime: string;
    description?: string | undefined;
    locationId?: string | undefined;
    assetId?: string | undefined;
    isRecurring?: boolean | undefined;
    recurrence?: string | undefined;
}, {
    title: string;
    startTime: string;
    endTime: string;
    description?: string | undefined;
    locationId?: string | undefined;
    assetId?: string | undefined;
    isRecurring?: boolean | undefined;
    recurrence?: string | undefined;
}>;
export declare const createMaintenanceSchema: z.ZodObject<{
    assetId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
    assignedToId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    assetId: string;
    title: string;
    description?: string | undefined;
    assignedToId?: string | undefined;
}, {
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    assetId: string;
    title: string;
    description?: string | undefined;
    assignedToId?: string | undefined;
}>;
export declare const createAuditSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodString;
    auditorId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    departmentId: string;
    title: string;
    auditorId: string;
    description?: string | undefined;
}, {
    departmentId: string;
    title: string;
    auditorId: string;
    description?: string | undefined;
}>;
export declare const updateAssetSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    categoryId: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
    locationId: z.ZodOptional<z.ZodString>;
    serialNumber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    purchaseDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    warrantyExpiry: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    supplier: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    purchaseCost: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
} & {
    currentStatus: z.ZodOptional<z.ZodEnum<["AVAILABLE", "ALLOCATED", "RESERVED", "MAINTENANCE", "LOST", "DISPOSED", "RETIRED"]>>;
    condition: z.ZodOptional<z.ZodEnum<["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"]>>;
    lifecycle: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "DISPOSED"]>>;
    healthScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    departmentId?: string | undefined;
    description?: string | undefined;
    serialNumber?: string | undefined;
    currentStatus?: "AVAILABLE" | "ALLOCATED" | "RESERVED" | "MAINTENANCE" | "LOST" | "DISPOSED" | "RETIRED" | undefined;
    healthScore?: number | undefined;
    categoryId?: string | undefined;
    purchaseDate?: string | undefined;
    warrantyExpiry?: string | undefined;
    supplier?: string | undefined;
    purchaseCost?: number | undefined;
    condition?: "NEW" | "GOOD" | "FAIR" | "POOR" | "DAMAGED" | undefined;
    lifecycle?: "DISPOSED" | "ACTIVE" | "INACTIVE" | undefined;
    locationId?: string | undefined;
}, {
    name?: string | undefined;
    departmentId?: string | undefined;
    description?: string | undefined;
    serialNumber?: string | undefined;
    currentStatus?: "AVAILABLE" | "ALLOCATED" | "RESERVED" | "MAINTENANCE" | "LOST" | "DISPOSED" | "RETIRED" | undefined;
    healthScore?: number | undefined;
    categoryId?: string | undefined;
    purchaseDate?: string | undefined;
    warrantyExpiry?: string | undefined;
    supplier?: string | undefined;
    purchaseCost?: number | undefined;
    condition?: "NEW" | "GOOD" | "FAIR" | "POOR" | "DAMAGED" | undefined;
    lifecycle?: "DISPOSED" | "ACTIVE" | "INACTIVE" | undefined;
    locationId?: string | undefined;
}>;
export declare const addTimelineEventSchema: z.ZodObject<{
    type: z.ZodEnum<["CREATED", "ALLOCATED", "TRANSFERRED", "MAINTENANCE_REQUESTED", "MAINTENANCE_COMPLETED", "AUDITED", "RETURNED", "DISPOSED", "BOOKED"]>;
    description: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "ALLOCATED" | "DISPOSED" | "CREATED" | "TRANSFERRED" | "MAINTENANCE_REQUESTED" | "MAINTENANCE_COMPLETED" | "AUDITED" | "RETURNED" | "BOOKED";
    description: string;
    metadata?: Record<string, any> | undefined;
}, {
    type: "ALLOCATED" | "DISPOSED" | "CREATED" | "TRANSFERRED" | "MAINTENANCE_REQUESTED" | "MAINTENANCE_COMPLETED" | "AUDITED" | "RETURNED" | "BOOKED";
    description: string;
    metadata?: Record<string, any> | undefined;
}>;
export declare const allocationActionSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
}, {
    notes?: string | undefined;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    password: string;
}, {
    token: string;
    password: string;
}>;
export declare const aiChatSchema: z.ZodObject<{
    message: z.ZodString;
    conversationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    conversationId?: string | undefined;
}, {
    message: string;
    conversationId?: string | undefined;
}>;
//# sourceMappingURL=index.d.ts.map