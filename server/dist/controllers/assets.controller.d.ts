import { Request, Response } from "express";
export declare const uploadAssetPhoto: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const assetsController: {
    list: (req: Request, res: Response, next: import("express").NextFunction) => void;
    create: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    update: (req: Request, res: Response, next: import("express").NextFunction) => void;
    remove: (req: Request, res: Response, next: import("express").NextFunction) => void;
    generateQR: (req: Request, res: Response, next: import("express").NextFunction) => void;
    timeline: (req: Request, res: Response, next: import("express").NextFunction) => void;
    addTimelineEvent: (req: Request, res: Response, next: import("express").NextFunction) => void;
    uploadPhoto: (req: Request, res: Response, next: import("express").NextFunction) => void;
};
//# sourceMappingURL=assets.controller.d.ts.map