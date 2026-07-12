"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static ok(res, data, status = 200) {
        return res.status(status).json({ success: true, data });
    }
    static msg(res, message, status = 200) {
        return res.status(status).json({ success: true, message });
    }
    static register = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { user, organization } = await auth_service_1.authService.register(req.body);
        return AuthController.ok(res, { user, organization }, 201);
    });
    static login = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.login(req.body.email, req.body.password);
        return AuthController.ok(res, result, 200);
    });
    static refresh = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: "Refresh token is required" });
        }
        const result = await auth_service_1.authService.refreshAccessToken(refreshToken);
        return AuthController.ok(res, result, 200);
    });
    static forgotPassword = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.forgotPassword(req.body.email);
        return AuthController.msg(res, result.message, 200);
    });
    static resetPassword = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.resetPassword(req.body.token, req.body.password);
        return AuthController.msg(res, result.message, 200);
    });
    static me = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = await auth_service_1.authService.getMe(req.user.id);
        return AuthController.ok(res, user, 200);
    });
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map