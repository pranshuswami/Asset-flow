export declare function listCategories(organizationId: string, includeInactive?: boolean): Promise<({
    _count: {
        assets: number;
    };
} & {
    name: string;
    organizationId: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
    icon: string | null;
})[]>;
export declare function createCategory(organizationId: string, data: {
    name: string;
    description?: string;
    icon?: string;
}): Promise<{
    _count: {
        assets: number;
    };
} & {
    name: string;
    organizationId: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
    icon: string | null;
}>;
export declare function updateCategory(id: string, organizationId: string, data: {
    name?: string;
    description?: string | null;
    icon?: string | null;
    isActive?: boolean;
}): Promise<{
    _count: {
        assets: number;
    };
} & {
    name: string;
    organizationId: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
    icon: string | null;
}>;
export declare function deleteCategory(id: string, organizationId: string): Promise<{
    message: string;
}>;
export declare const categoriesService: {
    listCategories: typeof listCategories;
    createCategory: typeof createCategory;
    updateCategory: typeof updateCategory;
    deleteCategory: typeof deleteCategory;
};
//# sourceMappingURL=categories.service.d.ts.map