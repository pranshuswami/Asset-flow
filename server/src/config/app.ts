import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./env";
import { errorHandler } from "../middlewares/error.middleware";
import { authRouter } from "../routes/auth.routes";
import { categoriesRouter } from "../routes/categories.routes";
import { organizationRouter } from "../routes/organization.routes";
import { assetsRouter } from "../routes/assets.routes";
import { employeesRouter } from "../routes/employees.routes";
import { departmentsRouter } from "../routes/departments.routes";
import { locationsRouter } from "../routes/locations.routes";
import { allocationsRouter } from "../routes/allocations.routes";
import { bookingsRouter } from "../routes/bookings.routes";
import { maintenanceRouter } from "../routes/maintenance.routes";
import { auditsRouter } from "../routes/audits.routes";
import { reportsRouter } from "../routes/reports.routes";
import { searchRouter } from "../routes/search.routes";
import { settingsRouter } from "../routes/settings.routes";
import { aiRouter } from "../routes/ai.routes";
import { notificationsRouter } from "../routes/notifications.routes";
import { socketService } from "../services/socket.service";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/", limiter);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/organization", organizationRouter);
  app.use("/api/assets", assetsRouter);
  app.use("/api/employees", employeesRouter);
  app.use("/api/departments", departmentsRouter);
  app.use("/api/locations", locationsRouter);
  app.use("/api/allocations", allocationsRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/maintenance", maintenanceRouter);
  app.use("/api/audits", auditsRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/notifications", notificationsRouter);

  app.use(errorHandler);

  return app;
}
