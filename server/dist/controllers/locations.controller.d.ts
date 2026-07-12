import { Response } from "express";
export declare class LocationsController {
    static ok(res: Response, data: any, status?: number): Response<any, Record<string, any>>;
    static msg(res: Response, message: string, status?: number): Response<any, Record<string, any>>;
    static list: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static create: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static update: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static delete: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=locations.controller.d.ts.map