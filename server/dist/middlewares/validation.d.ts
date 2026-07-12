import { Request, Response, NextFunction } from "express";
import { z } from "zod";
export declare function validateBody<T extends z.ZodSchema>(schema: T): (req: Request, _res: Response, next: NextFunction) => void;
export declare function validateQuery<T extends z.ZodSchema>(schema: T): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map