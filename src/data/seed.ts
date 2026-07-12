import type {
  ActivityFeedItem,
  Allocation,
  Asset,
  AssetCategory,
  AssetCondition,
  AssetLifecycle,
  Audit,
  Booking,
  Department,
  Insight,
  Location,
  MaintenanceRequest,
  Notification,
  User,
} from "@/types";

// Deterministic PRNG so the dataset is stable across reloads (portfolio demo).
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20240217);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]!;
const range = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const daysAgo = (d: number) => new Date(Date.now() - d * 864e5).toISOString();
const daysAhead = (d: number) => new Date(Date.now() + d * 864e5).toISOString();

const FIRST_NAMES = [
  "Riya", "Arjun", "Meera", "Kabir", "Anaya", "Vihaan", "Sara", "Rohan", "Isha", "Dev",
  "Neha", "Karthik", "Priya", "Aditya", "Lakshmi", "Omar", "Yuki", "Lena", "Noah", "Maya",
  "Elena", "Marcus", "Sofia", "Diego", "Aisha", "Tariq", "Hannah", "Liam", "Zoe", "Felix",
];
const LAST_NAMES = [
  "Sharma", "Patel", "Nair", "Rao", "Gupta", "Iyer", "Khan", "Reddy", "Das", "Mehta",
  "Verma", "Bose", "Menon", "Chopra", "Singh", "Kapoor", "Bhat", "Joshi", "Nanda", "Roy",
];

const DEPARTMENTS_SEED: { name: string; code: string; budget: number }[] = [
  { name: "Engineering", code: "ENG", budget: 2_400_000 },
  { name: "Marketing", code: "MKT", budget: 980_000 },
  { name: "Sales", code: "SLS", budget: 1_500_000 },
  { name: "Operations", code: "OPS", budget: 1_200_000 },
  { name: "Finance", code: "FIN", budget: 760_000 },
  { name: "People", code: "PPL", budget: 540_000 },
  { name: "Research", code: "RND", budget: 1_850_000 },
  { name: "Design", code: "DSN", budget: 640_000 },
];

const CATEGORIES: AssetCategory[] = [
  "ELECTRONICS", "VEHICLES", "FURNITURE", "IT_EQUIPMENT", "MEDICAL", "DOCUMENTS",
];
const STATUSES: AssetLifecycle[] = [
  "AVAILABLE", "ALLOCATED", "RESERVED", "MAINTENANCE", "LOST", "DISPOSED", "RETIRED",
];
const CONDITIONS: AssetCondition[] = ["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"];

const ASSET_NAMES: Record<AssetCategory, string[]> = {
  ELECTRONICS: ["Dell Latitude 7440", "MacBook Pro 16", "iPad Air", "Samsung Monitor 27\"", "Logitech Webcam"],
  VEHICLES: ["Toyota HiAce Van", "Tesla Model Y", "Ford Transit", "Hyundai i20", "Mahindra Thar"],
  FURNITURE: ["Herman Miller Aeron", "Standing Desk", "Conference Table", "Ergo Chair", "Sofa Lounge"],
  IT_EQUIPMENT: ["Cisco Switch", "Ubiquiti AP", "Dell Server R740", "NAS Storage", "Firewall Appliance"],
  MEDICAL: ["Defibrillator", "Patient Monitor", "Wheelchair XL", "Oxygen Concentrator", "Infusion Pump"],
  DOCUMENTS: ["Lease Agreement", "Compliance Binder", "Policy Manual", "Contract Vault", "Audit File"],
};

const SUPPLIERS = ["Ingram Micro", "TechData", "CDW", "Wipro", "Infosys", "Local Vendor"];

export interface Database {
  users: User[];
  departments: Department[];
  locations: Location[];
  assets: Asset[];
  allocations: Allocation[];
  bookings: Booking[];
  maintenance: MaintenanceRequest[];
  audits: Audit[];
  notifications: Notification[];
  insights: Insight[];
  activity: ActivityFeedItem[];
}

function buildUsers(departments: Department[]): User[] {
  const users: User[] = [];
  let n = 0;
  for (const dept of departments) {
    const count = range(6, 14);
    for (let i = 0; i < count; i++) {
      const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
      const role =
        i === 0 ? "DEPARTMENT_HEAD" : n % 11 === 0 ? "ASSET_MANAGER" : n % 23 === 0 ? "ADMIN" : "EMPLOYEE";
      users.push({
        id: `usr_${(n + 1).toString().padStart(4, "0")}`,
        name,
        email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@assetflow.io`,
        role,
        departmentId: dept.id,
        title: pick(["Engineer", "Senior Engineer", "Lead", "Manager", "Analyst", "Specialist", "Coordinator"]),
        phone: `+91 9${range(100000000, 999999999)}`,
        status: rand() > 0.08 ? "ACTIVE" : "INVITED",
        createdAt: daysAgo(range(30, 900)),
        lastActive: daysAgo(range(0, 20)),
      });
      n++;
    }
  }
  return users;
}

function buildDepartments(): Department[] {
  return DEPARTMENTS_SEED.map((d, i) => ({
    id: `dep_${(i + 1).toString().padStart(2, "0")}`,
    name: d.name,
    code: d.code,
    status: "ACTIVE",
    budget: d.budget,
    memberCount: 0,
    color: [
      "#6d5efc", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#8b5cf6", "#14b8a6",
    ][i]!,
  }));
}

function buildLocations(): Location[] {
  const buildings = ["HQ Tower", "Tech Park", "Innovation Hub", "Warehouse B"];
  const floors = ["L1", "L2", "L3", "L4", "L5"];
  const rooms: string[] = [];
  for (const b of buildings) {
    for (const f of floors) {
      for (let r = 1; r <= 4; r++) rooms.push(`${b}|${f}|${f}-${r.toString().padStart(2, "0")}`);
    }
  }
  return rooms.slice(0, 60).map((r, i) => {
    const [building, floor, room] = r.split("|");
    return { id: `loc_${(i + 1).toString().padStart(3, "0")}`, building, floor, room, campus: "Bangalore" };
  });
}

function buildAssets(departments: Department[], users: User[], locations: Location[]): Asset[] {
  const assets: Asset[] = [];
  const total = 480;
  for (let i = 0; i < total; i++) {
    const category = pick(CATEGORIES);
    const dept = pick(departments);
    const status = pick(STATUSES);
    const condition = pick(CONDITIONS);
    const createdDay = range(40, 800);
    const purchaseDay = createdDay + range(0, 30);
    const health = range(35, 100);
    const assetId = `AF-${(1000 + i).toString()}`;
    const owner = status === "ALLOCATED" ? pick(users) : undefined;
    const lastUsedDay = range(0, 200);
    const timeline = buildTimeline(assetId, owner?.name ?? "System", createdDay, status);
    assets.push({
      id: assetId,
      assetId,
      name: pick(ASSET_NAMES[category]),
      category,
      serialNumber: `SN-${range(100000, 999999)}-${category.slice(0, 3)}`,
      model: `MK-${range(1, 9)}.${range(0, 9)}`,
      status,
      condition,
      ownerId: owner?.id,
      departmentId: dept.id,
      locationId: pick(locations).id,
      purchaseDate: daysAgo(purchaseDay),
      purchasePrice: range(120, 4200) * 10,
      warrantyExpiry: daysAhead(range(-120, 400)),
      supplier: pick(SUPPLIERS),
      healthScore: health,
      riskScore: 100 - health,
      nextServiceDate: daysAhead(range(-30, 180)),
      utilization: range(8, 96),
      lastUsed: lastUsedDay < 30 ? daysAgo(lastUsedDay) : undefined,
      createdAt: daysAgo(createdDay),
      timeline,
      documents: [
        { id: `doc_${i}_1`, name: "Purchase Invoice.pdf", url: "#", size: range(120, 900) },
        { id: `doc_${i}_2`, name: "Warranty Card.pdf", url: "#", size: range(80, 400) },
      ],
    });
  }
  return assets;
}

function buildTimeline(
  assetId: string,
  owner: string,
  createdDay: number,
  status: AssetLifecycle
): Asset["timeline"] {
  const events: Asset["timeline"] = [
    {
      id: `${assetId}-t0`,
      type: "CREATED",
      title: "Asset registered",
      description: "Asset created in inventory",
      actor: "System",
      createdAt: daysAgo(createdDay),
    },
  ];
  if (status === "ALLOCATED") {
    events.push({
      id: `${assetId}-t1`,
      type: "ALLOCATED",
      title: "Allocated to user",
      description: `Assigned to ${owner}`,
      actor: owner,
      createdAt: daysAgo(Math.max(1, createdDay - range(2, 30))),
    });
  }
  if (status === "MAINTENANCE") {
    events.push(
      {
        id: `${assetId}-t2`,
        type: "MAINTENANCE_REQUESTED",
        title: "Maintenance requested",
        description: "Reported performance issue",
        actor: owner,
        createdAt: daysAgo(range(2, 20)),
      },
      {
        id: `${assetId}-t3`,
        type: "MAINTENANCE_COMPLETED",
        title: "Maintenance completed",
        description: "Serviced and verified",
        actor: "Technician",
        createdAt: daysAgo(range(0, 2)),
      }
    );
  }
  return events;
}

function buildAllocations(assets: Asset[], users: User[]): Allocation[] {
  return assets
    .filter((a) => a.status === "ALLOCATED" || a.status === "RESERVED")
    .slice(0, 120)
    .map((a, i) => {
      const to = users.find((u) => u.id === a.ownerId) ?? pick(users);
      const status = a.status === "RESERVED" ? "APPROVED" : pick(["TRANSFERRED", "RETURNED", "REQUESTED", "APPROVED"] as const);
      return {
        id: `alc_${(i + 1).toString().padStart(4, "0")}`,
        assetId: a.id,
        toUserId: to.id,
        departmentId: a.departmentId,
        status,
        reason: pick(["New hire onboarding", "Project allocation", "Replacement", "Temporary use"]),
        condition: a.condition,
        requestedBy: pick(users).name,
        approvedBy: status !== "REQUESTED" ? pick(users).name : undefined,
        requestedAt: daysAgo(range(1, 60)),
        transferredAt: status === "TRANSFERRED" ? daysAgo(range(0, 30)) : undefined,
        returnedAt: status === "RETURNED" ? daysAgo(range(0, 20)) : undefined,
        expectedReturn: daysAhead(range(5, 60)),
      };
    });
}

function buildBookings(users: User[]): Booking[] {
  const bookings: Booking[] = [];
  const resourceTypes: Booking["resourceType"][] = ["ROOM", "VEHICLE", "PROJECTOR", "EQUIPMENT"];
  for (let i = 0; i < 90; i++) {
    const type = pick(resourceTypes);
    const day = range(-10, 25);
    const startH = range(8, 16);
    const duration = pick([1, 1, 2, 3]);
    const start = new Date(Date.now() + day * 864e5);
    start.setHours(startH, 0, 0, 0);
    const end = new Date(start.getTime() + duration * 36e5);
    bookings.push({
      id: `bk_${(i + 1).toString().padStart(4, "0")}`,
      resourceId: `res_${range(1, 30)}`,
      resourceName:
        type === "ROOM"
          ? `Conference Room ${pick(["A", "B", "C", "D"])}`
          : type === "VEHICLE"
          ? pick(["Tesla Model Y", "Ford Transit", "Hyundai i20"])
          : type === "PROJECTOR"
          ? "Epson Projector"
          : "AV Kit",
      resourceType: type,
      userId: pick(users).id,
      title: pick(["Sprint Planning", "Client Demo", "1:1", "All-Hands", "Design Review", "Roadmap Sync"]),
      start: start.toISOString(),
      end: end.toISOString(),
      status: day < 0 ? "COMPLETED" : pick(["CONFIRMED", "PENDING", "CHECKED_IN"]),
      recurring: rand() > 0.7,
      attendees: Array.from({ length: range(1, 6) }, () => pick(users).id),
    });
  }
  return bookings.sort((a, b) => +new Date(a.start) - +new Date(b.start));
}

function buildMaintenance(assets: Asset[], users: User[]): MaintenanceRequest[] {
  return assets
    .filter((a) => a.status === "MAINTENANCE" || rand() > 0.85)
    .slice(0, 80)
    .map((a, i) => {
      const status = pick(["PENDING", "APPROVED", "REJECTED", "IN_PROGRESS", "RESOLVED"] as const);
      return {
        id: `mnt_${(i + 1).toString().padStart(4, "0")}`,
        assetId: a.id,
        assetName: a.name,
        raisedBy: pick(users).name,
        technician: status !== "PENDING" && status !== "REJECTED" ? pick(users).name : undefined,
        priority: pick(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const),
        issue: pick([
          "Battery not charging",
          "Screen flickering",
          "Overheating under load",
          "Network adapter failure",
          "Physical damage on chassis",
          "Unusual noise from fan",
        ]),
        status,
        cost: status === "RESOLVED" ? range(40, 800) : undefined,
        photos: [],
        createdAt: daysAgo(range(0, 60)),
        resolvedAt: status === "RESOLVED" ? daysAgo(range(0, 5)) : undefined,
      };
    });
}

function buildAudits(departments: Department[], users: User[], assets: Asset[]): Audit[] {
  const audits: Audit[] = [];
  for (let i = 0; i < 6; i++) {
    const deptIds = [pick(departments).id, pick(departments).id];
    const assetIds = assets.slice(i * 30, i * 30 + 30).map((a) => a.id);
    const status = pick(["DRAFT", "IN_PROGRESS", "COMPLETED", "CLOSED"] as const);
    const items = assetIds.map((aid) => ({
      assetId: aid,
      status: pick(["VERIFIED", "VERIFIED", "VERIFIED", "MISSING", "DAMAGED", "PENDING"] as const),
      verifiedBy: pick(users).name,
    }));
    audits.push({
      id: `aud_${(i + 1).toString().padStart(3, "0")}`,
      title: `Q${i + 1} Physical Count — ${pick(departments).name}`,
      status,
      auditorIds: [pick(users).id, pick(users).id],
      departmentIds: [...new Set(deptIds)],
      assetIds,
      items,
      progress: status === "CLOSED" || status === "COMPLETED" ? 100 : range(20, 90),
      createdAt: daysAgo(range(10, 200)),
      closedAt: status === "CLOSED" ? daysAgo(range(0, 10)) : undefined,
    });
  }
  return audits;
}

function buildNotifications(users: User[]): Notification[] {
  const types: Notification["type"][] = [
    "ASSET_ASSIGNED", "TRANSFER_APPROVED", "BOOKING_REMINDER", "MAINTENANCE_APPROVED",
    "AUDIT_STARTED", "ASSET_RETURNED", "OVERDUE_RETURN", "INSIGHT",
  ];
  const titles: Record<Notification["type"], string> = {
    ASSET_ASSIGNED: "MacBook Pro 16 allocated to you",
    TRANSFER_APPROVED: "Transfer request approved",
    BOOKING_REMINDER: "Conference Room B in 30 minutes",
    MAINTENANCE_APPROVED: "Maintenance request approved",
    AUDIT_STARTED: "Q2 Physical Count audit started",
    ASSET_RETURNED: "Dell Latitude returned",
    OVERDUE_RETURN: "Asset return is overdue",
    INSIGHT: "New insight available",
    MENTION: "You were mentioned",
  };
  return Array.from({ length: 24 }, (_, i) => {
    const type = pick(types);
    return {
      id: `not_${(i + 1).toString().padStart(3, "0")}`,
      type,
      title: titles[type],
      body: pick([
        "Allocated from Engineering inventory.",
        "Approved by Asset Manager.",
        "Reminder: please join on time.",
        "Technician assigned, ETA 2h.",
        "3 discrepancies found. Review needed.",
        "Condition verified as Good.",
      ]),
      read: i > 6,
      createdAt: daysAgo(range(0, 14)),
      href: "/assets",
      actor: pick(users).name,
    };
  });
}

function buildInsights(assets: Asset[]): Insight[] {
  const idleCount = assets.filter((a) => a.lastUsed && Date.now() - +new Date(a.lastUsed) > 180 * 864e5).length;
  return [
    {
      id: "ins_1",
      title: "Marketing has the highest overdue returns",
      description: "12 assets are past their expected return date in Marketing.",
      severity: "warning",
      metric: "12 overdue",
      delta: 18,
      recommendation: "Send reminders and enforce return SLAs for the Marketing team.",
      createdAt: daysAgo(1),
    },
    {
      id: "ins_2",
      title: `${idleCount} assets unused for 180+ days`,
      description: "Idle inventory is tying up capital. Consider reallocating or retiring.",
      severity: "critical",
      metric: `${idleCount} idle`,
      delta: -4,
      recommendation: "Run a utilization review on long-idle assets.",
      createdAt: daysAgo(2),
    },
    {
      id: "ins_3",
      title: "Laptop maintenance up 35% this quarter",
      description: "Maintenance frequency for laptops increased sharply vs last quarter.",
      severity: "warning",
      metric: "+35%",
      delta: 35,
      recommendation: "Investigate a batch issue with the latest shipment.",
      createdAt: daysAgo(3),
    },
    {
      id: "ins_4",
      title: "Conference Room A is overbooked",
      description: "Room A hits 92% utilization — the highest across all locations.",
      severity: "info",
      metric: "92% util",
      delta: 12,
      recommendation: "Rebalance recurring meetings to Room C and Room D.",
      createdAt: daysAgo(4),
    },
    {
      id: "ins_5",
      title: "Inventory utilization improved 12%",
      description: "Overall utilization climbed after the reallocation drive.",
      severity: "positive",
      metric: "+12%",
      delta: 12,
      recommendation: "Keep the reallocation cadence monthly.",
      createdAt: daysAgo(5),
    },
  ];
}

function buildActivity(users: User[], assets: Asset[]): ActivityFeedItem[] {
  const types: ActivityFeedItem["type"][] = [
    "CREATED", "ALLOCATED", "TRANSFERRED", "MAINTENANCE_REQUESTED",
    "MAINTENANCE_COMPLETED", "AUDITED", "RETURNED", "DISPOSED", "RESERVED", "UPDATED",
  ];
  return Array.from({ length: 40 }, (_, i) => {
    const type = pick(types);
    const user = pick(users);
    const asset = pick(assets);
    return {
      id: `act_${(i + 1).toString().padStart(4, "0")}`,
      type,
      actor: user.name,
      actorAvatar: user.avatar,
      target: asset.name,
      summary: summaryFor(type, asset.name, user.name),
      createdAt: daysAgo(i / 2 + range(0, 2)),
    };
  });
}

function summaryFor(type: ActivityFeedItem["type"], asset: string, user: string): string {
  switch (type) {
    case "CREATED": return `registered ${asset}`;
    case "ALLOCATED": return `allocated ${asset} to ${user}`;
    case "TRANSFERRED": return `transferred ${asset} to ${user}`;
    case "MAINTENANCE_REQUESTED": return `requested maintenance for ${asset}`;
    case "MAINTENANCE_COMPLETED": return `completed maintenance for ${asset}`;
    case "AUDITED": return `audited ${asset}`;
    case "RETURNED": return `returned ${asset}`;
    case "DISPOSED": return `disposed ${asset}`;
    case "RESERVED": return `reserved ${asset}`;
    case "UPDATED": return `updated details for ${asset}`;
  }
}

export function createDatabase(): Database {
  const departments = buildDepartments();
  const users = buildUsers(departments);
  const locations = buildLocations();
  const assets = buildAssets(departments, users, locations);
  departments.forEach((d) => (d.memberCount = users.filter((u) => u.departmentId === d.id).length));
  return {
    departments,
    users,
    locations,
    assets,
    allocations: buildAllocations(assets, users),
    bookings: buildBookings(users),
    maintenance: buildMaintenance(assets, users),
    audits: buildAudits(departments, users, assets),
    notifications: buildNotifications(users),
    insights: buildInsights(assets),
    activity: buildActivity(users, assets),
  };
}
