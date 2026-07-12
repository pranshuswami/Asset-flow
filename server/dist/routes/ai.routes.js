"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const schemas_1 = require("../schemas");
exports.aiRouter = (0, express_1.Router)();
exports.aiRouter.use(auth_middleware_1.authMiddleware);
exports.aiRouter.use(auth_middleware_1.requireOrg);
exports.aiRouter.post("/chat", (0, validation_middleware_1.validateBody)(schemas_1.aiChatSchema), (0, error_middleware_1.asyncHandler)(ai_controller_1.aiController.chat));
//# sourceMappingURL=ai.routes.js.map