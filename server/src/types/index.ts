import "express";

declare global {
  namespace Express {
<<<<<<< HEAD
=======
    interface Request {
      user?: AuthUser;
    }

>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
    interface User {
      id: string;
      email: string;
      role: string;
      organizationId?: string;
    }
<<<<<<< HEAD
    interface Request {
      user?: User & {
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
        emailVerified?: boolean;
        isActive?: boolean;
        lastLoginAt?: Date;
        organization?: {
          id: string;
          name: string;
          slug: string;
          plan: string;
        };
        employee?: {
          id: string;
          employeeCode: string;
          designation: string;
          department: {
            id: string;
            name: string;
            code: string;
          };
        };
      };
    }
=======
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
  }
}

export interface AuthUser extends Express.User {}
