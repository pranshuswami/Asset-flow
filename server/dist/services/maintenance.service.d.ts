import { MaintenanceStatus, MaintenancePriority, Prisma } from "@prisma/client";
export interface MaintenanceListFilters {
    organizationId: string;
    assetId?: string;
    status?: MaintenanceStatus;
    priority?: MaintenancePriority;
    assignedToId?: string;
}
export interface MaintenanceListResult {
    data: any[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare const maintenanceService: {
    list(filters: MaintenanceListFilters, page?: number, limit?: number): Promise<MaintenanceListResult>;
    getById(id: string, organizationId: string): Promise<{
        asset: {
            name: string;
            organizationId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            departmentId: string;
            description: string | null;
            serialNumber: string | null;
            assetCode: string;
            currentStatus: import(".prisma/client").$Enums.AssetStatus;
            healthScore: number | null;
            categoryId: string;
            purchaseDate: Date | null;
            warrantyExpiry: Date | null;
            supplier: string | null;
            purchaseCost: number | null;
            condition: import(".prisma/client").$Enums.AssetCondition;
            lifecycle: import(".prisma/client").$Enums.AssetLifecycle;
            qrCodeUrl: string | null;
            photoUrl: string | null;
            documents: Prisma.JsonValue | null;
            metadata: Prisma.JsonValue | null;
            lastServicedAt: Date | null;
            nextServiceDue: Date | null;
            locationId: string;
            ownerId: string | null;
            createdById: string;
        };
        assignedTo: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            userId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            employeeCode: string;
            designation: string;
            departmentId: string;
            profilePicture: string | null;
            phone: string | null;
            joinDate: Date;
        }) | null;
    } & {
        priority: import(".prisma/client").$Enums.MaintenancePriority;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MaintenanceStatus;
        description: string | null;
        assetId: string;
        title: string;
        assignedToId: string | null;
        photos: Prisma.JsonValue | null;
        cost: number | null;
        resolvedAt: Date | null;
    }>;
    create(data: any, createdById: string): Promise<{
        asset: {
            name: string;
            organizationId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            departmentId: string;
            description: string | null;
            serialNumber: string | null;
            assetCode: string;
            currentStatus: import(".prisma/client").$Enums.AssetStatus;
            healthScore: number | null;
            categoryId: string;
            purchaseDate: Date | null;
            warrantyExpiry: Date | null;
            supplier: string | null;
            purchaseCost: number | null;
            condition: import(".prisma/client").$Enums.AssetCondition;
            lifecycle: import(".prisma/client").$Enums.AssetLifecycle;
            qrCodeUrl: string | null;
            photoUrl: string | null;
            documents: Prisma.JsonValue | null;
            metadata: Prisma.JsonValue | null;
            lastServicedAt: Date | null;
            nextServiceDue: Date | null;
            locationId: string;
            ownerId: string | null;
            createdById: string;
        };
        assignedTo: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            userId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            employeeCode: string;
            designation: string;
            departmentId: string;
            profilePicture: string | null;
            phone: string | null;
            joinDate: Date;
        }) | null;
    } & {
        priority: import(".prisma/client").$Enums.MaintenancePriority;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MaintenanceStatus;
        description: string | null;
        assetId: string;
        title: string;
        assignedToId: string | null;
        photos: Prisma.JsonValue | null;
        cost: number | null;
        resolvedAt: Date | null;
    }>;
    updateStatus(id: string, organizationId: string, status: MaintenanceStatus): Promise<{
        asset: {
            name: string;
            organizationId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            departmentId: string;
            description: string | null;
            serialNumber: string | null;
            assetCode: string;
            currentStatus: import(".prisma/client").$Enums.AssetStatus;
            healthScore: number | null;
            categoryId: string;
            purchaseDate: Date | null;
            warrantyExpiry: Date | null;
            supplier: string | null;
            purchaseCost: number | null;
            condition: import(".prisma/client").$Enums.AssetCondition;
            lifecycle: import(".prisma/client").$Enums.AssetLifecycle;
            qrCodeUrl: string | null;
            photoUrl: string | null;
            documents: Prisma.JsonValue | null;
            metadata: Prisma.JsonValue | null;
            lastServicedAt: Date | null;
            nextServiceDue: Date | null;
            locationId: string;
            ownerId: string | null;
            createdById: string;
        };
        assignedTo: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            userId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            employeeCode: string;
            designation: string;
            departmentId: string;
            profilePicture: string | null;
            phone: string | null;
            joinDate: Date;
        }) | null;
    } & {
        priority: import(".prisma/client").$Enums.MaintenancePriority;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MaintenanceStatus;
        description: string | null;
        assetId: string;
        title: string;
        assignedToId: string | null;
        photos: Prisma.JsonValue | null;
        cost: number | null;
        resolvedAt: Date | null;
    }>;
    assignTechnician(id: string, organizationId: string, assignedToId: string): Promise<{
        asset: {
            name: string;
            organizationId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            departmentId: string;
            description: string | null;
            serialNumber: string | null;
            assetCode: string;
            currentStatus: import(".prisma/client").$Enums.AssetStatus;
            healthScore: number | null;
            categoryId: string;
            purchaseDate: Date | null;
            warrantyExpiry: Date | null;
            supplier: string | null;
            purchaseCost: number | null;
            condition: import(".prisma/client").$Enums.AssetCondition;
            lifecycle: import(".prisma/client").$Enums.AssetLifecycle;
            qrCodeUrl: string | null;
            photoUrl: string | null;
            documents: Prisma.JsonValue | null;
            metadata: Prisma.JsonValue | null;
            lastServicedAt: Date | null;
            nextServiceDue: Date | null;
            locationId: string;
            ownerId: string | null;
            createdById: string;
        };
        assignedTo: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            userId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            employeeCode: string;
            designation: string;
            departmentId: string;
            profilePicture: string | null;
            phone: string | null;
            joinDate: Date;
        }) | null;
    } & {
        priority: import(".prisma/client").$Enums.MaintenancePriority;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MaintenanceStatus;
        description: string | null;
        assetId: string;
        title: string;
        assignedToId: string | null;
        photos: Prisma.JsonValue | null;
        cost: number | null;
        resolvedAt: Date | null;
    }>;
    orgOfAsset(assetId: string): Promise<string>;
};
//# sourceMappingURL=maintenance.service.d.ts.map