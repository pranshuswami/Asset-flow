import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
export interface AuthPayload extends JwtPayload {
    userId: string;
    email: string;
    role: string;
    organizationId?: string;
}
export declare function generateTokens(payload: Omit<AuthPayload, "iat" | "exp">): {
    accessToken: string;
    refreshToken: string;
};
export declare function verifyAccessToken(token: string): AuthPayload;
export declare function verifyRefreshToken(token: string): AuthPayload;
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function requireRole(...roles: string[]): (req: Request, _res: Response, next: NextFunction) => void;
export declare function requireOrg(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map