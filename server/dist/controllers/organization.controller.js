"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationController = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const organization_service_1 = require("../services/organization.service");
class OrganizationController {
    static ok(res, data, status = 200) {
        return res.status(status).json({ success: true, data });
    }
    static msg(res, message, status = 200) {
        return res.status(status).json({ success: true, message });
    }
    static getOrganization = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const organization = await organization_service_1.organizationService.getOrganization(req.user.organizationId);
        return OrganizationController.ok(res, organization, 200);
    });
    static updateOrganization = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const organization = await organization_service_1.organizationService.updateOrganization(req.user.organizationId, req.body);
        return OrganizationController.ok(res, organization, 200);
    });
}
exports.OrganizationController = OrganizationController;
//# sourceMappingURL=organization.controller.js.map