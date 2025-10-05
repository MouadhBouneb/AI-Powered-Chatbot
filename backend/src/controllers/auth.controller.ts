import type { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import {
  validateRequest,
  getTranslator,
  sendSuccess,
  sendError,
  asyncHandler,
} from "../utils/controller";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
  language: z.enum(["en", "ar"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const service = new AuthService();

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const data = validateRequest(req, res, signupSchema);
  if (!data) return;

  try {
    const { email, password, name, language } = data;
    const result = await service.signup(
      email,
      password,
      name,
      language || "en"
    );
    sendSuccess(res, result);
  } catch (e) {
    if ((e as Error).message === "EMAIL_IN_USE") {
      return sendError(res, 400, "Email in use");
    }
    throw e;
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const t = getTranslator(req);
  const data = validateRequest(req, res, loginSchema);
  if (!data) return;

  try {
    const { email, password } = data;
    const result = await service.login(email, password);
    sendSuccess(res, result);
  } catch (e) {
    if ((e as Error).message === "INVALID_CREDENTIALS") {
      return sendError(res, 401, t("auth_invalid"));
    }
    throw e;
  }
});
