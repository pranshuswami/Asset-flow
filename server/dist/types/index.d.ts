import "express";
declare global {
    namespace Express {
        interface User {
            id: string;
            email: string;
            role: string;
            organizationId?: string;
        }
        interface Request {
            user?: User & {
                firstName?: string;
                lastName?: string;
                avatarUrl?: string;
                emailVerified?: boolean;
                isActive?: boolean;
                lastLoginAt?: Date;
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
                    department: {
                        id: string;
                        name: string;
                        code: string;
                    };
                };
            };
        }
    }
}
export interface AuthUser extends Express.User {
}
//# sourceMappingURL=index.d.ts.map