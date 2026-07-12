import { AuditStatus, AuditItemStatus, Prisma } from "@prisma/client";
export interface AuditListFilters {
    organizationId: string;
    departmentId?: string;
    status?: AuditStatus;
    auditorId?: string;
}
export interface AuditListResult {
    data: any[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare const auditsService: {
    list(filters: AuditListFilters, page?: number, limit?: number): Promise<AuditListResult>;
    getById(id: string, organizationId: string): Promise<{
        department: {
            name: string;
            organizationId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            description: string | null;
            headId: string | null;
            parentId: string | null;
        };
        auditor: {
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
        items: ({
            asset: {
                name: string;
                id: string;
                assetCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.AuditItemStatus;
            assetId: string;
            photos: Prisma.JsonValue | null;
            auditId: string;
            remarks: string | null;
            verifiedAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        departmentId: string;
        status: import(".prisma/client").$Enums.AuditStatus;
        description: string | null;
        title: string;
        auditorId: string;
        startedAt: Date | null;
        closedAt: Date | null;
    }>;
    create(data: any, createdById: string): Promise<{
        department: {
            name: string;
            organizationId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            description: string | null;
            headId: string | null;
            parentId: string | null;
        };
        auditor: {
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
        items: ({
            asset: {
                name: string;
                id: string;
                assetCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.AuditItemStatus;
            assetId: string;
            photos: Prisma.JsonValue | null;
            auditId: string;
            remarks: string | null;
            verifiedAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        departmentId: string;
        status: import(".prisma/client").$Enums.AuditStatus;
        description: string | null;
        title: string;
        auditorId: string;
        startedAt: Date | null;
        closedAt: Date | null;
    }>;
    addItems(id: string, organizationId: string, items: {
        assetId: string;
        remarks?: string;
    }[]): Promise<{
        department: {
            name: string;
            organizationId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            description: string | null;
            headId: string | null;
            parentId: string | null;
        };
        auditor: {
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
        items: ({
            asset: {
                name: string;
                id: string;
                assetCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.AuditItemStatus;
            assetId: string;
            photos: Prisma.JsonValue | null;
            auditId: string;
            remarks: string | null;
            verifiedAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        departmentId: string;
        status: import(".prisma/client").$Enums.AuditStatus;
        description: string | null;
        title: string;
        auditorId: string;
        startedAt: Date | null;
        closedAt: Date | null;
    }>;
    verifyItem(id: string, itemId: string, organizationId: string, data: {
        status: AuditItemStatus;
        remarks?: string;
        photos?: any;
    }): Promise<{
        asset: {
            name: string;
            id: string;
            assetCode: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.AuditItemStatus;
        assetId: string;
        photos: Prisma.JsonValue | null;
        auditId: string;
        remarks: string | null;
        verifiedAt: Date | null;
    }>;
    closeAudit(id: string, organizationId: string): Promise<{
        department: {
            name: string;
            organizationId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            description: string | null;
            headId: string | null;
            parentId: string | null;
        };
        auditor: {
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
        items: ({
            asset: {
                name: string;
                id: string;
                assetCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.AuditItemStatus;
            assetId: string;
            photos: Prisma.JsonValue | null;
            auditId: string;
            remarks: string | null;
            verifiedAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        departmentId: string;
        status: import(".prisma/client").$Enums.AuditStatus;
        description: string | null;
        title: string;
        auditorId: string;
        startedAt: Date | null;
        closedAt: Date | null;
    }>;
};
//# sourceMappingURL=audits.service.d.ts.map