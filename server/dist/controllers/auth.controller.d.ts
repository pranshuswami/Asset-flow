import { Response } from "express";
export declare class AuthController {
    static ok(res: Response, data: any, status?: number): Response<any, Record<string, any>>;
    static msg(res: Response, message: string, status?: number): Response<any, Record<string, any>>;
    static register: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static login: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static refresh: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static forgotPassword: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static resetPassword: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static me: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=auth.controller.d.ts.map