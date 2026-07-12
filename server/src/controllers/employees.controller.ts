import { Response } from "express";
import { asyncHandler } from "../middlewares/error.middleware";
import { employeesService } from "../services/employees.service";

export class EmployeesController {
  static ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  static msg(res: Response, message: string, status = 200) {
    return res.status(status).json({ success: true, message });
  }

  static list = asyncHandler(async (req: any, res: Response) => {
    const departmentId = req.query.departmentId as string | undefined;
    const employees = await employeesService.listEmployees(req.user.organizationId!, departmentId);
    return EmployeesController.ok(res, employees, 200);
  });

  static create = asyncHandler(async (req: any, res: Response) => {
    const employee = await employeesService.createEmployee(req.user.organizationId!, req.body);
    return EmployeesController.ok(res, employee, 201);
  });

  static getById = asyncHandler(async (req: any, res: Response) => {
    const employee = await employeesService.getEmployeeById(req.params.id, req.user.organizationId!);
    return EmployeesController.ok(res, employee, 200);
  });

  static update = asyncHandler(async (req: any, res: Response) => {
    const employee = await employeesService.updateEmployee(req.params.id, req.user.organizationId!, req.body);
    return EmployeesController.ok(res, employee, 200);
  });
}
