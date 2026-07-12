import { Response } from "express";
import { asyncHandler } from "../middlewares/error.middleware";
import { departmentsService } from "../services/departments.service";

export class DepartmentsController {
  static ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  static msg(res: Response, message: string, status = 200) {
    return res.status(status).json({ success: true, message });
  }

  static list = asyncHandler(async (req: any, res: Response) => {
    const includeInactive = req.query.includeInactive === "true";
    const departments = await departmentsService.listDepartments(req.user.organizationId!, includeInactive);
    return DepartmentsController.ok(res, departments, 200);
  });

  static create = asyncHandler(async (req: any, res: Response) => {
    const department = await departmentsService.createDepartment(req.user.organizationId!, req.body);
    return DepartmentsController.ok(res, department, 201);
  });

  static update = asyncHandler(async (req: any, res: Response) => {
    const department = await departmentsService.updateDepartment(req.params.id, req.user.organizationId!, req.body);
    return DepartmentsController.ok(res, department, 200);
  });

  static delete = asyncHandler(async (req: any, res: Response) => {
    const result = await departmentsService.deleteDepartment(req.params.id, req.user.organizationId!);
    return DepartmentsController.msg(res, result.message, 200);
  });
}
