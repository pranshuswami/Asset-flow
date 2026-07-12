"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationService = void 0;
exports.getOrganization = getOrganization;
exports.updateOrganization = updateOrganization;
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
async function getOrganization(organizationId) {
    const organization = await db_1.prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
            _count: { select: { users: true, departments: true, categories: true, locations: true, assets: true } },
        },
    });
    if (!organization) {
        throw new errors_1.NotFoundError("Organization not found");
    }
    return organization;
}
async function updateOrganization(organizationId, data) {
    const existing = await db_1.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!existing) {
        throw new errors_1.NotFoundError("Organization not found");
    }
    if (data.slug && data.slug !== existing.slug) {
        const slugTaken = await db_1.prisma.organization.findUnique({ where: { slug: data.slug } });
        if (slugTaken) {
            throw new errors_1.ConflictError("Slug already in use");
        }
    }
    const updated = await db_1.prisma.organization.update({
        where: { id: organizationId },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.slug !== undefined && { slug: data.slug }),
            ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
            ...(data.plan !== undefined && { plan: data.plan }),
            ...(data.settings !== undefined && { settings: data.settings }),
        },
    });
    return updated;
}
exports.organizationService = {
    getOrganization,
    updateOrganization,
};
//# sourceMappingURL=organization.service.js.map