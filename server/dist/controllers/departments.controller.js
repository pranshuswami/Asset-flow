"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentsController = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const departments_service_1 = require("../services/departments.service");
class DepartmentsController {
    static ok(res, data, status = 200) {
        return res.status(status).json({ success: true, data });
    }
    static msg(res, message, status = 200) {
        return res.status(status).json({ success: true, message });
    }
    static list = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const includeInactive = req.query.includeInactive === "true";
        const departments = await departments_service_1.departmentsService.listDepartments(req.user.organizationId, includeInactive);
        return DepartmentsController.ok(res, departments, 200);
    });
    static create = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const department = await departments_service_1.departmentsService.createDepartment(req.user.organizationId, req.body);
        return DepartmentsController.ok(res, department, 201);
    });
    static update = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const department = await departments_service_1.departmentsService.updateDepartment(req.params.id, req.user.organizationId, req.body);
        return DepartmentsController.ok(res, department, 200);
    });
    static delete = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const result = await departments_service_1.departmentsService.deleteDepartment(req.params.id, req.user.organizationId);
        return DepartmentsController.msg(res, result.message, 200);
    });
}
exports.DepartmentsController = DepartmentsController;
//# sourceMappingURL=departments.controller.js.map