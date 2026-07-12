import { db } from "@/data/db";
import { includesSearch, paginate, request, sortBy, type Query } from "@/services/http";
import type { Department, User } from "@/types";
import type { EmployeeInput } from "@/schemas";

export const departmentsService = {
  async list(query: Query = {}): Promise<Department[]> {
    return request(() =>
      db.departments.filter((d) => includesSearch(d, ["name", "code"], query.search as string))
    );
  },

  async create(input: {
    name: string;
    code: string;
    headId?: string;
    parentId?: string;
    budget: number;
    status: "ACTIVE" | "INACTIVE";
  }): Promise<Department> {
    return request(() => {
      const dept: Department = {
        id: `dep_${db.departments.length + 1}`,
        name: input.name,
        code: input.code,
        headId: input.headId,
        parentId: input.parentId,
        status: input.status,
        budget: input.budget,
        memberCount: 0,
        color: ["#6d5efc", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"][db.departments.length % 6]!,
      };
      db.departments.push(dept);
      return dept;
    });
  },
};

const USER_SEARCH: (keyof User)[] = ["name", "email", "title", "role"];

export const employeesService = {
  async list(query: Query = {}): Promise<{ data: User[]; total: number; page: number; pageSize: number }> {
    return request(() => {
      let items = db.users.slice();
      if (query.departmentId) items = items.filter((u) => u.departmentId === query.departmentId);
      if (query.role) items = items.filter((u) => u.role === query.role);
      if (query.status) items = items.filter((u) => u.status === query.status);
      items = items.filter((u) => includesSearch(u, USER_SEARCH, query.search as string));
      items = sortBy(items, query.sortBy, query.sortDir);
      return paginate(items, query);
    });
  },

  async create(input: EmployeeInput): Promise<User> {
    return request(() => {
      const user: User = {
        id: `usr_${db.users.length + 1}`,
        name: input.name,
        email: input.email,
        role: input.role,
        departmentId: input.departmentId,
        title: input.title,
        phone: input.phone,
        status: "INVITED",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      db.users.unshift(user);
      return user;
    });
  },

  async update(id: string, patch: Partial<EmployeeInput>): Promise<User> {
    return request(() => {
      const user = db.users.find((u) => u.id === id);
      if (!user) throw new Error("User not found");
      Object.assign(user, patch);
      return user;
    });
  },
};

export const locationsService = {
  async list(): Promise<import("@/types").Location[]> {
    return request(() => db.locations);
  },
};
