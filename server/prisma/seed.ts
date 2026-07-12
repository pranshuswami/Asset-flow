import { PrismaClient, Role, AssetStatus, AssetCondition, AssetLifecycle, AllocationStatus, TransferStatus, BookingStatus, MaintenancePriority, MaintenanceStatus, AuditStatus, AuditItemStatus, NotificationType, InsightSeverity } from "@prisma/client";
import bcrypt from "bcryptjs";
import { env } from "../src/config/env";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "acme" },
    update: {},
    create: {
      name: "Acme Corporation",
      slug: "acme",
      plan: "ENTERPRISE",
      settings: {},
    },
  });

  const headUser = await prisma.user.upsert({
    where: { email: "admin@acme.com" },
    update: {},
    create: {
      email: "admin@acme.com",
      passwordHash: await bcrypt.hash("Admin@123", 10),
      firstName: "Admin",
      lastName: "User",
      role: Role.ADMIN,
      emailVerified: true,
      organizationId: org.id,
    },
  });

  const engDept = await prisma.department.upsert({
    where: { code: "ENG" },
    update: {},
    create: {
      name: "Engineering",
      code: "ENG",
      description: "Engineering department",
      organizationId: org.id,
    },
  });

  const mktDept = await prisma.department.upsert({
    where: { code: "MKT" },
    update: {},
    create: {
      name: "Marketing",
      code: "MKT",
      description: "Marketing department",
      organizationId: org.id,
    },
  });

  const headEmployee = await prisma.employee.upsert({
    where: { employeeCode: "EMP-001" },
    update: {},
    create: {
      employeeCode: "EMP-001",
      designation: "CTO",
      departmentId: engDept.id,
      userId: headUser.id,
    },
  });

  await prisma.department.update({
    where: { id: engDept.id },
    data: { headId: headEmployee.id },
  });

  const laptopCat = await prisma.category.upsert({
    where: { id: "cat-laptop" },
    update: {},
    create: {
      id: "cat-laptop",
      name: "Laptops",
      description: "Laptop computers",
      organizationId: org.id,
    },
  });

  const loc1 = await prisma.location.upsert({
    where: { code: "LOC-001" },
    update: {},
    create: {
      code: "LOC-001",
      building: "Tower A",
      floor: "3rd",
      room: "301",
      organizationId: org.id,
    },
  });

  const asset = await prisma.asset.create({
    data: {
      assetCode: "AF-001",
      name: "MacBook Pro 16",
      description: "Primary development machine",
      categoryId: laptopCat.id,
      departmentId: engDept.id,
      locationId: loc1.id,
      serialNumber: "MBP16-2024-001",
      purchaseDate: new Date("2024-01-15"),
      warrantyExpiry: new Date("2027-01-15"),
      supplier: "Apple Inc.",
      purchaseCost: 2499,
      currentStatus: AssetStatus.AVAILABLE,
      condition: AssetCondition.NEW,
      lifecycle: AssetLifecycle.ACTIVE,
      createdById: headUser.id,
    },
  });

  await prisma.assetTimeline.create({
    data: {
      assetId: asset.id,
      type: "CREATED",
      description: "Asset registered in system",
      actorName: "Admin User",
    },
  });

  await prisma.notification.create({
    data: {
      userId: headUser.id,
      type: NotificationType.SYSTEM,
      title: "Welcome to AssetFlow AI",
      message: "Your organization has been set up successfully.",
    },
  });

  await prisma.aiInsight.createMany({
    data: [
      {
        title: "High utilization in Engineering",
        description: "Engineering department asset utilization is above 85%.",
        severity: InsightSeverity.POSITIVE,
        metric: "Utilization",
        delta: 12.4,
        recommendation: "Consider adding 2 laptops to Engineering for peak periods.",
      },
      {
        title: "23 assets idle for 180+ days",
        description: "Several assets have not been allocated for over 6 months.",
        severity: InsightSeverity.WARNING,
        metric: "Idle Assets",
        delta: -8.2,
        recommendation: "Review idle assets and consider redistribution or disposal.",
      },
    ],
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });