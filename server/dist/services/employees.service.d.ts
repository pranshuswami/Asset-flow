export declare function listEmployees(organizationId: string, departmentId?: string): Promise<({
    user: {
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        firstName: string;
        lastName: string;
    };
    department: {
        name: string;
        id: string;
        code: string;
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
})[]>;
export declare function createEmployee(organizationId: string, data: {
    employeeCode: string;
    designation: string;
    departmentId: string;
    userId: string;
    phone?: string;
}): Promise<{
    user: {
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        firstName: string;
        lastName: string;
    };
    department: {
        name: string;
        id: string;
        code: string;
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
}>;
export declare function updateEmployee(id: string, organizationId: string, data: {
    designation?: string;
    departmentId?: string;
    phone?: string | null;
    isActive?: boolean;
}): Promise<{
    user: {
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        firstName: string;
        lastName: string;
    };
    department: {
        name: string;
        id: string;
        code: string;
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
}>;
export declare function getEmployeeById(id: string, organizationId: string): Promise<{
    user: {
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        firstName: string;
        lastName: string;
    };
    department: {
        name: string;
        id: string;
        code: string;
    };
    allocations: ({
        asset: {
            name: string;
            id: string;
            assetCode: string;
            currentStatus: import(".prisma/client").$Enums.AssetStatus;
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
}>;
export declare const employeesService: {
    listEmployees: typeof listEmployees;
    createEmployee: typeof createEmployee;
    updateEmployee: typeof updateEmployee;
    getEmployeeById: typeof getEmployeeById;
};
//# sourceMappingURL=employees.service.d.ts.map