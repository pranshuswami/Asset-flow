import { prisma } from "../config/db";
import { BadRequestError, ForbiddenError, NotFoundError, ConflictError } from "../utils/errors";

export async function getOrganization(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      _count: { select: { users: true, departments: true, categories: true, locations: true, assets: true } },
    },
  });

  if (!organization) {
    throw new NotFoundError("Organization not found");
  }

  return organization;
}

export async function updateOrganization(organizationId: string, data: { name?: string; slug?: string; logoUrl?: string | null; plan?: string; settings?: any }) {
  const existing = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!existing) {
    throw new NotFoundError("Organization not found");
  }

  if (data.slug && data.slug !== existing.slug) {
    const slugTaken = await prisma.organization.findUnique({ where: { slug: data.slug } });
    if (slugTaken) {
      throw new ConflictError("Slug already in use");
    }
  }

  const updated = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.plan !== undefined && { plan: data.plan as any }),
      ...(data.settings !== undefined && { settings: data.settings }),
    },
  });

  return updated;
}

export const organizationService = {
  getOrganization,
  updateOrganization,
};
