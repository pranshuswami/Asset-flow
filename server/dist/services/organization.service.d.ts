export declare function getOrganization(organizationId: string): Promise<{
    _count: {
        users: number;
        departments: number;
        categories: number;
        locations: number;
        assets: number;
    };
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    logoUrl: string | null;
    plan: import(".prisma/client").$Enums.Plan;
    settings: import("@prisma/client/runtime/library").JsonValue | null;
}>;
export declare function updateOrganization(organizationId: string, data: {
    name?: string;
    slug?: string;
    logoUrl?: string | null;
    plan?: string;
    settings?: any;
}): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    logoUrl: string | null;
    plan: import(".prisma/client").$Enums.Plan;
    settings: import("@prisma/client/runtime/library").JsonValue | null;
}>;
export declare const organizationService: {
    getOrganization: typeof getOrganization;
    updateOrganization: typeof updateOrganization;
};
//# sourceMappingURL=organization.service.d.ts.map