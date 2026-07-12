"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsController = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const locations_service_1 = require("../services/locations.service");
class LocationsController {
    static ok(res, data, status = 200) {
        return res.status(status).json({ success: true, data });
    }
    static msg(res, message, status = 200) {
        return res.status(status).json({ success: true, message });
    }
    static list = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const includeInactive = req.query.includeInactive === "true";
        const locations = await locations_service_1.locationsService.listLocations(req.user.organizationId, includeInactive);
        return LocationsController.ok(res, locations, 200);
    });
    static create = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const location = await locations_service_1.locationsService.createLocation(req.user.organizationId, req.body);
        return LocationsController.ok(res, location, 201);
    });
    static update = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const location = await locations_service_1.locationsService.updateLocation(req.params.id, req.user.organizationId, req.body);
        return LocationsController.ok(res, location, 200);
    });
    static delete = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const result = await locations_service_1.locationsService.deleteLocation(req.params.id, req.user.organizationId);
        return LocationsController.msg(res, result.message, 200);
    });
}
exports.LocationsController = LocationsController;
//# sourceMappingURL=locations.controller.js.map