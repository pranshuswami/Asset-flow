import { Booking, BookingStatus, Prisma } from "@prisma/client";
export interface BookingListFilters {
    organizationId: string;
    employeeId?: string;
    assetId?: string;
    locationId?: string;
    status?: BookingStatus;
    from?: Date;
    to?: Date;
}
export interface BookingListResult {
    data: Booking[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare const bookingsService: {
    list(filters: BookingListFilters, page?: number, limit?: number): Promise<BookingListResult>;
    getById(id: string, organizationId: string): Promise<{
        employee: {
            user: {
                email: string;
                role: import(".prisma/client").$Enums.Role;
                organizationId: string | null;
                id: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
                emailVerified: boolean;
                isActive: boolean;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
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
        };
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
        } | null;
        location: {
            organizationId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            building: string;
            floor: string | null;
            room: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        description: string | null;
        locationId: string | null;
        assetId: string | null;
        employeeId: string;
        title: string;
        startTime: Date;
        endTime: Date;
        isRecurring: boolean;
        recurrence: string | null;
        reminderAt: Date | null;
    }>;
    create(data: any, employeeId: string): Promise<{
        employee: {
            user: {
                email: string;
                role: import(".prisma/client").$Enums.Role;
                organizationId: string | null;
                id: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
                emailVerified: boolean;
                isActive: boolean;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
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
        };
        asset: {
            name: string;
            id: string;
            assetCode: string;
        } | null;
        location: {
            organizationId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            building: string;
            floor: string | null;
            room: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        description: string | null;
        locationId: string | null;
        assetId: string | null;
        employeeId: string;
        title: string;
        startTime: Date;
        endTime: Date;
        isRecurring: boolean;
        recurrence: string | null;
        reminderAt: Date | null;
    }>;
    update(id: string, organizationId: string, data: any): Promise<{
        employee: {
            user: {
                email: string;
                role: import(".prisma/client").$Enums.Role;
                organizationId: string | null;
                id: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
                emailVerified: boolean;
                isActive: boolean;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
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
        };
        asset: {
            name: string;
            id: string;
            assetCode: string;
        } | null;
        location: {
            organizationId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            building: string;
            floor: string | null;
            room: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        description: string | null;
        locationId: string | null;
        assetId: string | null;
        employeeId: string;
        title: string;
        startTime: Date;
        endTime: Date;
        isRecurring: boolean;
        recurrence: string | null;
        reminderAt: Date | null;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
    }>;
};
//# sourceMappingURL=bookings.service.d.ts.map