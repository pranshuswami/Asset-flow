import { Response } from "express";
import { asyncHandler } from "../middlewares/error.middleware";
import { authService } from "../services/auth.service";

export class AuthController {
  static ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  static msg(res: Response, message: string, status = 200) {
    return res.status(status).json({ success: true, message });
  }

  static register = asyncHandler(async (req: any, res: Response) => {
    const { user, organization } = await authService.register(req.body);
    return AuthController.ok(res, { user, organization }, 201);
  });

  static login = asyncHandler(async (req: any, res: Response) => {
    const result = await authService.login(req.body.email, req.body.password);
    return AuthController.ok(res, result, 200);
  });

  static refresh = asyncHandler(async (req: any, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required" });
    }
    const result = await authService.refreshAccessToken(refreshToken);
    return AuthController.ok(res, result, 200);
  });

  static forgotPassword = asyncHandler(async (req: any, res: Response) => {
    const result = await authService.forgotPassword(req.body.email);
    return AuthController.msg(res, result.message, 200);
  });

  static resetPassword = asyncHandler(async (req: any, res: Response) => {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    return AuthController.msg(res, result.message, 200);
  });

  static me = asyncHandler(async (req: any, res: Response) => {
    const user = await authService.getMe(req.user.id);
    return AuthController.ok(res, user, 200);
  });
}
