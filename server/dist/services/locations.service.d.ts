export declare function listLocations(organizationId: string, includeInactive?: boolean): Promise<({
    _count: {
        assets: number;
        bookings: number;
    };
} & {
    organizationId: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    code: string;
    building: string;
    floor: string | null;
    room: string | null;
})[]>;
export declare function createLocation(organizationId: string, data: {
    building: string;
    code: string;
    floor?: string;
    room?: string;
}): Promise<{
    _count: {
        assets: number;
        bookings: number;
    };
} & {
    organizationId: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    code: string;
    building: string;
    floor: string | null;
    room: string | null;
}>;
export declare function updateLocation(id: string, organizationId: string, data: {
    building?: string;
    code?: string;
    floor?: string | null;
    room?: string | null;
    isActive?: boolean;
}): Promise<{
    _count: {
        assets: number;
        bookings: number;
    };
} & {
    organizationId: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    code: string;
    building: string;
    floor: string | null;
    room: string | null;
}>;
export declare function deleteLocation(id: string, organizationId: string): Promise<{
    message: string;
}>;
export declare const locationsService: {
    listLocations: typeof listLocations;
    createLocation: typeof createLocation;
    updateLocation: typeof updateLocation;
    deleteLocation: typeof deleteLocation;
};
//# sourceMappingURL=locations.service.d.ts.map