export declare function listDepartments(organizationId: string, includeInactive?: boolean): Promise<({
    _count: {
        assets: number;
        employees: number;
    };
    head: {
        user: {
            firstName: string;
            lastName: string;
        };
        id: string;
        employeeCode: string;
        designation: string;
    } | null;
    parent: {
        name: string;
        id: string;
        code: string;
    } | null;
    children: {
        name: string;
        id: string;
        code: string;
    }[];
} & {
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
})[]>;
export declare function createDepartment(organizationId: string, data: {
    name: string;
    code: string;
    description?: string;
    headId?: string;
    parentId?: string;
}): Promise<{
    _count: {
        assets: number;
        employees: number;
    };
    head: {
        user: {
            firstName: string;
            lastName: string;
        };
        id: string;
        employeeCode: string;
        designation: string;
    } | null;
    parent: {
        name: string;
        id: string;
        code: string;
    } | null;
} & {
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
}>;
export declare function updateDepartment(id: string, organizationId: string, data: {
    name?: string;
    code?: string;
    description?: string;
    headId?: string | null;
    parentId?: string | null;
    isActive?: boolean;
}): Promise<{
    _count: {
        assets: number;
        employees: number;
    };
    head: {
        user: {
            firstName: string;
            lastName: string;
        };
        id: string;
        employeeCode: string;
        designation: string;
    } | null;
    parent: {
        name: string;
        id: string;
        code: string;
    } | null;
} & {
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
}>;
export declare function deleteDepartment(id: string, organizationId: string): Promise<{
    message: string;
}>;
export declare const departmentsService: {
    listDepartments: typeof listDepartments;
    createDepartment: typeof createDepartment;
    updateDepartment: typeof updateDepartment;
    deleteDepartment: typeof deleteDepartment;
};
//# sourceMappingURL=departments.service.d.ts.map