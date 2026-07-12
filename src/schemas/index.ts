import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Enter a valid email"),
    organization: z.string().min(2, "Organization name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const assetSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.enum(["ELECTRONICS", "VEHICLES", "FURNITURE", "IT_EQUIPMENT", "MEDICAL", "DOCUMENTS"]),
  serialNumber: z.string().min(2, "Serial number is required"),
  model: z.string().optional(),
  status: z.enum(["AVAILABLE", "ALLOCATED", "RESERVED", "MAINTENANCE", "LOST", "DISPOSED", "RETIRED"]),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"]),
  departmentId: z.string().min(1, "Department is required"),
  locationId: z.string().min(1, "Location is required"),
  ownerId: z.string().optional(),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchasePrice: z.coerce.number().min(0, "Price must be positive"),
  warrantyExpiry: z.string().optional(),
  supplier: z.string().optional(),
});
export type AssetInput = z.infer<typeof assetSchema>;

export const allocationSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  toUserId: z.string().min(1, "Recipient is required"),
  departmentId: z.string().min(1, "Department is required"),
  reason: z.string().optional(),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"]),
  expectedReturn: z.string().optional(),
});
export type AllocationInput = z.infer<typeof allocationSchema>;

export const bookingSchema = z.object({
  resourceId: z.string().min(1, "Resource is required"),
  resourceType: z.enum(["ROOM", "VEHICLE", "PROJECTOR", "EQUIPMENT"]),
  title: z.string().min(2, "Title is required"),
  userId: z.string().min(1, "User is required"),
  start: z.string().min(1, "Start time is required"),
  end: z.string().min(1, "End time is required"),
  recurring: z.boolean().optional(),
  attendees: z.array(z.string()).optional(),
});
export type BookingInput = z.infer<typeof bookingSchema>;

export const maintenanceSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  issue: z.string().min(5, "Describe the issue"),
  technician: z.string().optional(),
});
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;

export const auditSchema = z.object({
  title: z.string().min(2, "Title is required"),
  auditorIds: z.array(z.string()).min(1, "Select at least one auditor"),
  departmentIds: z.array(z.string()).min(1, "Select at least one department"),
});
export type AuditInput = z.infer<typeof auditSchema>;

export const departmentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required").max(6),
  headId: z.string().optional(),
  parentId: z.string().optional(),
  budget: z.coerce.number().min(0),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
export type DepartmentInput = z.infer<typeof departmentSchema>;

export const employeeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"]),
  departmentId: z.string().min(1, "Department is required"),
  title: z.string().min(2, "Title is required"),
  phone: z.string().optional(),
});
export type EmployeeInput = z.infer<typeof employeeSchema>;

export const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  title: z.string().min(2, "Title is required"),
  phone: z.string().optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;
