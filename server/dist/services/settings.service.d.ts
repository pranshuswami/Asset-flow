export interface ProfileData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl: string | null;
    organization?: {
        id: string;
        name: string;
        slug: string;
        plan: string;
    };
    employee?: {
        id: string;
        employeeCode: string;
        designation: string;
        profilePicture: string | null;
        phone: string | null;
        joinDate: Date;
        department: {
            id: string;
            name: string;
            code: string;
        };
    };
}
export declare const settingsService: {
    getProfile(userId: string): Promise<ProfileData>;
    updateProfile(userId: string, data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatarUrl?: string;
    }): Promise<{
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
    }>;
    updateNotifications(userId: string, settings: any): Promise<{
        settings: any;
    }>;
};
//# sourceMappingURL=settings.service.d.ts.map