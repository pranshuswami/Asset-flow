import { Response } from "express";
export declare class CategoriesController {
    static ok(res: Response, data: any, status?: number): Response<any, Record<string, any>>;
    static msg(res: Response, message: string, status?: number): Response<any, Record<string, any>>;
    static list: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static create: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static update: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static delete: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=categories.controller.d.ts.map