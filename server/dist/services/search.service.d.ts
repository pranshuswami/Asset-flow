export interface SearchResult {
    query: string;
    results: {
        assets: any[];
        employees: any[];
        departments: any[];
        bookings: any[];
        maintenance: any[];
    };
    totalResults: number;
}
export interface NotificationListItem {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    isRead: boolean;
    metadata: any;
    createdAt: Date;
}
export declare const searchService: {
    globalSearch(organizationId: string, query: string): Promise<SearchResult>;
};
//# sourceMappingURL=search.service.d.ts.map