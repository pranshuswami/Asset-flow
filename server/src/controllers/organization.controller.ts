import { Response } from "express";
import { asyncHandler } from "../middlewares/error.middleware";
import { organizationService } from "../services/organization.service";

export class OrganizationController {
  static ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  static msg(res: Response, message: string, status = 200) {
    return res.status(status).json({ success: true, message });
  }

  static getOrganization = asyncHandler(async (req: any, res: Response) => {
    const organization = await organizationService.getOrganization(req.user.organizationId!);
    return OrganizationController.ok(res, organization, 200);
  });

  static updateOrganization = asyncHandler(async (req: any, res: Response) => {
    const organization = await organizationService.updateOrganization(req.user.organizationId!, req.body);
    return OrganizationController.ok(res, organization, 200);
  });
}
