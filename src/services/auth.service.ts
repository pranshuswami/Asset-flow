import { db } from "@/data/db";
import { ApiError, request } from "@/services/http";
import type { User } from "@/types";

const SESSION_KEY = "assetflow.session";

export interface Session {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: number;
}

function makeToken(user: User): string {
  return `mock.${btoa(JSON.stringify({ sub: user.id, role: user.role, iat: Date.now() }))}.jwt`;
}

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function createSession(user: User): Session {
  return { token: makeToken(user), refreshToken: makeToken(user), user, expiresAt: Date.now() + SESSION_DURATION_MS };
}

function persist(session: Session): Session {
  // Session storage limits exposure to the active browser session in this frontend-only demo.
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export const authService = {
  async login(email: string, password: string): Promise<Session> {
    return request(() => {
      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user || user.status !== "ACTIVE" || password !== "password123") {
        throw new ApiError(401, "Invalid email or password");
      }
      return persist(createSession(user));
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
      return persist(createSession(user));
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
      const raw = sessionStorage.getItem(SESSION_KEY);
      const session = raw ? (JSON.parse(raw) as Session) : null;
      if (!session || session.expiresAt <= Date.now()) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
  },

  async loginWithQr(payload: string): Promise<Session> {
    return request(() => {
      let code: URL;
      try {
        code = new URL(payload.trim());
      } catch {
        throw new ApiError(400, "This QR code is not a valid AssetFlow login code");
      }
      const expires = Number(code.searchParams.get("expires"));
      const userId = code.searchParams.get("user");
      if (code.protocol !== "assetflow:" || code.hostname !== "login" || !userId || !Number.isFinite(expires)) {
        throw new ApiError(400, "This QR code is not a valid AssetFlow login code");
      }
      if (expires <= Date.now()) throw new ApiError(401, "This QR login code has expired. Generate a new code and try again.");
      const user = db.users.find((candidate) => candidate.id === userId);
      if (!user || user.status !== "ACTIVE") throw new ApiError(401, "This QR code is no longer authorized");
      return persist(createSession(user));
    });
  },
};
