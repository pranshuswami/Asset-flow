export declare function register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
}): Promise<{
    user: {
        email: string;
        role: import(".prisma/client").$Enums.Role;
        organizationId: string | null;
        id: string;
        firstName: string;
        lastName: string;
    };
    organization: {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        logoUrl: string | null;
        plan: import(".prisma/client").$Enums.Plan;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    };
}>;
export declare function login(email: string, password: string): Promise<{
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        organizationId: string | null;
        emailVerified: boolean;
    };
    accessToken: string;
    refreshToken: string;
}>;
export declare function refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        organizationId: string | null;
    };
}>;
export declare function forgotPassword(email: string): Promise<{
    message: string;
}>;
export declare function resetPassword(token: string, newPassword: string): Promise<{
    message: string;
}>;
export declare function getMe(userId: string): Promise<{
    email: string;
    role: import(".prisma/client").$Enums.Role;
    organizationId: string | null;
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    emailVerified: boolean;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    organization: {
        name: string;
        id: string;
        slug: string;
        plan: import(".prisma/client").$Enums.Plan;
    } | null;
    employee: {
        id: string;
        employeeCode: string;
        designation: string;
        departmentId: string;
        phone: string | null;
    } | null;
}>;
export declare const authService: {
    register: typeof register;
    login: typeof login;
    refreshAccessToken: typeof refreshAccessToken;
    forgotPassword: typeof forgotPassword;
    resetPassword: typeof resetPassword;
    getMe: typeof getMe;
};
//# sourceMappingURL=auth.service.d.ts.map