"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesController = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const categories_service_1 = require("../services/categories.service");
class CategoriesController {
    static ok(res, data, status = 200) {
        return res.status(status).json({ success: true, data });
    }
    static msg(res, message, status = 200) {
        return res.status(status).json({ success: true, message });
    }
    static list = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const includeInactive = req.query.includeInactive === "true";
        const categories = await categories_service_1.categoriesService.listCategories(req.user.organizationId, includeInactive);
        return CategoriesController.ok(res, categories, 200);
    });
    static create = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const category = await categories_service_1.categoriesService.createCategory(req.user.organizationId, req.body);
        return CategoriesController.ok(res, category, 201);
    });
    static update = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const category = await categories_service_1.categoriesService.updateCategory(req.params.id, req.user.organizationId, req.body);
        return CategoriesController.ok(res, category, 200);
    });
    static delete = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const result = await categories_service_1.categoriesService.deleteCategory(req.params.id, req.user.organizationId);
        return CategoriesController.msg(res, result.message, 200);
    });
}
exports.CategoriesController = CategoriesController;
//# sourceMappingURL=categories.controller.js.map