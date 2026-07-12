import "express";
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
        interface User {
            id: string;
            email: string;
            role: string;
            organizationId?: string;
        }
    }
}
export interface AuthUser extends Express.User {
}
//# sourceMappingURL=index.d.ts.map