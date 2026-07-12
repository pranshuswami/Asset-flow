"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./env");
const error_middleware_1 = require("../middlewares/error.middleware");
const auth_routes_1 = require("../routes/auth.routes");
<<<<<<< HEAD
const categories_routes_1 = require("../routes/categories.routes");
=======
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
const organization_routes_1 = require("../routes/organization.routes");
const assets_routes_1 = require("../routes/assets.routes");
const employees_routes_1 = require("../routes/employees.routes");
const departments_routes_1 = require("../routes/departments.routes");
const locations_routes_1 = require("../routes/locations.routes");
const allocations_routes_1 = require("../routes/allocations.routes");
const bookings_routes_1 = require("../routes/bookings.routes");
const maintenance_routes_1 = require("../routes/maintenance.routes");
const audits_routes_1 = require("../routes/audits.routes");
const reports_routes_1 = require("../routes/reports.routes");
const search_routes_1 = require("../routes/search.routes");
const settings_routes_1 = require("../routes/settings.routes");
const ai_routes_1 = require("../routes/ai.routes");
const notifications_routes_1 = require("../routes/notifications.routes");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.env.corsOrigin,
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, morgan_1.default)(env_1.env.nodeEnv === "production" ? "combined" : "dev"));
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 60 * 1000,
        max: 120,
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use("/api/", limiter);
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
    app.use("/api/auth", auth_routes_1.authRouter);
<<<<<<< HEAD
    app.use("/api/categories", categories_routes_1.categoriesRouter);
=======
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
    app.use("/api/organization", organization_routes_1.organizationRouter);
    app.use("/api/assets", assets_routes_1.assetsRouter);
    app.use("/api/employees", employees_routes_1.employeesRouter);
    app.use("/api/departments", departments_routes_1.departmentsRouter);
    app.use("/api/locations", locations_routes_1.locationsRouter);
    app.use("/api/allocations", allocations_routes_1.allocationsRouter);
    app.use("/api/bookings", bookings_routes_1.bookingsRouter);
    app.use("/api/maintenance", maintenance_routes_1.maintenanceRouter);
    app.use("/api/audits", audits_routes_1.auditsRouter);
    app.use("/api/reports", reports_routes_1.reportsRouter);
    app.use("/api/search", search_routes_1.searchRouter);
    app.use("/api/settings", settings_routes_1.settingsRouter);
    app.use("/api/ai", ai_routes_1.aiRouter);
    app.use("/api/notifications", notifications_routes_1.notificationsRouter);
    app.use(error_middleware_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map