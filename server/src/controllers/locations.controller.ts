import { Response } from "express";
import { asyncHandler } from "../middlewares/error.middleware";
import { locationsService } from "../services/locations.service";

export class LocationsController {
  static ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  static msg(res: Response, message: string, status = 200) {
    return res.status(status).json({ success: true, message });
  }

  static list = asyncHandler(async (req: any, res: Response) => {
    const includeInactive = req.query.includeInactive === "true";
    const locations = await locationsService.listLocations(req.user.organizationId!, includeInactive);
    return LocationsController.ok(res, locations, 200);
  });

  static create = asyncHandler(async (req: any, res: Response) => {
    const location = await locationsService.createLocation(req.user.organizationId!, req.body);
    return LocationsController.ok(res, location, 201);
  });

  static update = asyncHandler(async (req: any, res: Response) => {
    const location = await locationsService.updateLocation(req.params.id, req.user.organizationId!, req.body);
    return LocationsController.ok(res, location, 200);
  });

  static delete = asyncHandler(async (req: any, res: Response) => {
    const result = await locationsService.deleteLocation(req.params.id, req.user.organizationId!);
    return LocationsController.msg(res, result.message, 200);
  });
}
