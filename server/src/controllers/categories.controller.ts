import { Response } from "express";
import { asyncHandler } from "../middlewares/error.middleware";
import { categoriesService } from "../services/categories.service";

export class CategoriesController {
  static ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  static msg(res: Response, message: string, status = 200) {
    return res.status(status).json({ success: true, message });
  }

  static list = asyncHandler(async (req: any, res: Response) => {
    const includeInactive = req.query.includeInactive === "true";
    const categories = await categoriesService.listCategories(req.user.organizationId!, includeInactive);
    return CategoriesController.ok(res, categories, 200);
  });

  static create = asyncHandler(async (req: any, res: Response) => {
    const category = await categoriesService.createCategory(req.user.organizationId!, req.body);
    return CategoriesController.ok(res, category, 201);
  });

  static update = asyncHandler(async (req: any, res: Response) => {
    const category = await categoriesService.updateCategory(req.params.id, req.user.organizationId!, req.body);
    return CategoriesController.ok(res, category, 200);
  });

  static delete = asyncHandler(async (req: any, res: Response) => {
    const result = await categoriesService.deleteCategory(req.params.id, req.user.organizationId!);
    return CategoriesController.msg(res, result.message, 200);
  });
}
