export interface AssetUtilizationReport {
    total: number;
    totalCost: number;
    utilizationRate: number;
    breakdown: {
        status: string;
        count: number;
        cost: number;
        percentage: number;
    }[];
}
export interface DepartmentUsageReport {
    totalAssets: number;
    departmentCount: number;
    data: {
        id: string;
        name: string;
        code: string;
        assetCount: number;
        percentage: number;
    }[];
}
export interface MaintenanceCostReport {
    period: string;
    totalCost: number;
    totalRequests: number;
    summaries: {
        priority: string;
        status: string;
        count: number;
        cost: number;
    }[];
    priorityBreakdown: {
        priority: string;
        cost: number;
        count: number;
    }[];
}
export interface IdleAssetsReport {
    total: number;
    assets: {
        id: string;
        assetCode: string;
        name: string;
        status: string;
        condition: string;
        lifecycle: string;
        lastServicedAt: Date | null;
        category: string;
        department: string;
        location: any;
        owner: string | null;
    }[];
}
export declare const reportsService: {
    getAssetUtilization(organizationId: string): Promise<AssetUtilizationReport>;
    getDepartmentUsage(organizationId: string): Promise<DepartmentUsageReport>;
    getMaintenanceCost(organizationId: string): Promise<MaintenanceCostReport>;
    getIdleAssets(organizationId: string): Promise<IdleAssetsReport>;
};
//# sourceMappingURL=reports.service.d.ts.map