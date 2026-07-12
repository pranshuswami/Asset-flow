export declare const allocationsService: {
    requestAllocation(data: {
        assetId: string;
        employeeId: string;
        notes?: string;
        conditionAtAllocation?: string;
    }, requestedByUserId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AllocationStatus;
        assetId: string;
        employeeId: string;
        notes: string | null;
        conditionAtAllocation: string | null;
        approvedAt: Date | null;
        returnedAt: Date | null;
    }>;
    approveAllocation(allocationId: string, approverUserId?: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AllocationStatus;
        assetId: string;
        employeeId: string;
        notes: string | null;
        conditionAtAllocation: string | null;
        approvedAt: Date | null;
        returnedAt: Date | null;
    }>;
    rejectAllocation(allocationId: string, approverUserId?: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AllocationStatus;
        assetId: string;
        employeeId: string;
        notes: string | null;
        conditionAtAllocation: string | null;
        approvedAt: Date | null;
        returnedAt: Date | null;
    }>;
    returnAsset(allocationId: string, actorUserId?: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AllocationStatus;
        assetId: string;
        employeeId: string;
        notes: string | null;
        conditionAtAllocation: string | null;
        approvedAt: Date | null;
        returnedAt: Date | null;
    }>;
    listAllocations(filters: {
        organizationId?: string;
        employeeId?: string;
        assetId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            employee: {
                user: {
                    email: string;
                    id: string;
                    firstName: string;
                    lastName: string;
                };
                id: string;
                employeeCode: string;
                designation: string;
            };
            asset: {
                name: string;
                id: string;
                assetCode: string;
                photoUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AllocationStatus;
            assetId: string;
            employeeId: string;
            notes: string | null;
            conditionAtAllocation: string | null;
            approvedAt: Date | null;
            returnedAt: Date | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
};
//# sourceMappingURL=allocations.service.d.ts.map