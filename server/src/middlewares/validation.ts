import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validateBody<T extends z.ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
      (error as any).status = 400;
      throw error;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateQuery<T extends z.ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      const error = new Error(parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
      (error as any).status = 400;
      throw error;
    }
    next();
  };
}
