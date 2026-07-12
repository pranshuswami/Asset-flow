"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesController = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const employees_service_1 = require("../services/employees.service");
class EmployeesController {
    static ok(res, data, status = 200) {
        return res.status(status).json({ success: true, data });
    }
    static msg(res, message, status = 200) {
        return res.status(status).json({ success: true, message });
    }
    static list = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const departmentId = req.query.departmentId;
        const employees = await employees_service_1.employeesService.listEmployees(req.user.organizationId, departmentId);
        return EmployeesController.ok(res, employees, 200);
    });
    static create = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const employee = await employees_service_1.employeesService.createEmployee(req.user.organizationId, req.body);
        return EmployeesController.ok(res, employee, 201);
    });
    static getById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const employee = await employees_service_1.employeesService.getEmployeeById(req.params.id, req.user.organizationId);
        return EmployeesController.ok(res, employee, 200);
    });
    static update = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const employee = await employees_service_1.employeesService.updateEmployee(req.params.id, req.user.organizationId, req.body);
        return EmployeesController.ok(res, employee, 200);
    });
}
exports.EmployeesController = EmployeesController;
//# sourceMappingURL=employees.controller.js.map