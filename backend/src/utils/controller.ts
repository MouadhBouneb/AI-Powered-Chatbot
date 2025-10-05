import type { Request, Response } from "express";
import type { ZodSchema } from "zod";

/**
 * Get the translation function from request
 */
export function getTranslator(req: Request): (key: string) => string {
  return (req as any).t as (k: string) => string;
}

/**
 * Get user language from request with fallback
 */
export function getUserLanguage(req: Request): "en" | "ar" {
  return (req.user?.language as any) || "en";
}

/**
 * Validate request body with Zod schema
 * Returns parsed data or sends error response
 */
export function validateRequest<T>(
  req: Request,
  res: Response,
  schema: ZodSchema<T>
): T | null {
  const t = getTranslator(req);
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: t("error_invalid_input") });
    return null;
  }

  return parsed.data;
}

/**
 * Handle async controller with automatic error catching
 */
export function asyncHandler(
  fn: (req: Request, res: Response) => Promise<any>
) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error) {
      console.error("Controller error:", error);
      const t = getTranslator(req);
      res.status(500).json({ error: t("error_server") || "Server error" });
    }
  };
}

/**
 * Send success response with optional message
 */
export function sendSuccess(res: Response, data: any, message?: string) {
  const response = message ? { ...data, message } : data;
  res.json(response);
}

/**
 * Send error response with appropriate status code
 */
export function sendError(res: Response, status: number, error: string) {
  res.status(status).json({ error });
}
