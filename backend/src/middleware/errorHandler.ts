import { type Request, type Response, type NextFunction } from "express";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // eslint-disable-next-line no-console
  console.error(err);
  const t = (req as any).t as (k: string) => string;
  const message = t ? t("error_invalid_input") : "Unexpected error";
  res.status(400).json({ error: message });
}
