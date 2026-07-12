import { db } from "@/data/db";
import { ApiError, request } from "@/services/http";
import type { User } from "@/types";

const SESSION_KEY = "assetflow.session";

export interface Session {
  token: string;
  refreshToken: string;
  user: User;
}

function makeToken(user: User): string {
  return `mock.${btoa(JSON.stringify({ sub: user.id, role: user.role, iat: Date.now() }))}.jwt`;
}

export const authService = {
  async login(email: string, password: string): Promise<Session> {
    return request(() => {
      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user || password.length < 8) {
        throw new ApiError(401, "Invalid email or password");
      }
      const session: Session = {
        token: makeToken(user),
        refreshToken: makeToken(user),
        user,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    });
  },

  async signup(input: { name: string; email: string; organization: string }): Promise<Session> {
    return request(() => {
      const exists = db.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
      if (exists) throw new ApiError(409, "An account with this email already exists");
      const user: User = {
        id: `usr_${db.users.length + 1}`,
        name: input.name,
        email: input.email,
        role: "ADMIN",
        departmentId: db.departments[0]!.id,
        title: "Organization Owner",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      db.users.unshift(user);
      const session: Session = { token: makeToken(user), refreshToken: makeToken(user), user };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    });
  },

  async forgotPassword(_email: string): Promise<{ sent: boolean }> {
    return request(() => ({ sent: true }));
  },

  async resetPassword(_password: string): Promise<{ ok: boolean }> {
    return request(() => ({ ok: true }));
  },

  getSession(): Session | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },
};
