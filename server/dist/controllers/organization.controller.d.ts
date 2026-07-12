import { Response } from "express";
export declare class OrganizationController {
    static ok(res: Response, data: any, status?: number): Response<any, Record<string, any>>;
    static msg(res: Response, message: string, status?: number): Response<any, Record<string, any>>;
    static getOrganization: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateOrganization: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=organization.controller.d.ts.map