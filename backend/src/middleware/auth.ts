import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.error("❌ Auth: No authorization header");
    const t = (req as any).t as (k: string) => string;
    return res.status(401).json({ error: t("auth_required") });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log("✅ Auth: Token verified for user:", decoded.userId);
    (req as any).user = { id: decoded.userId, email: "", language: "en" };
    return next();
  } catch (error) {
    console.error(
      "❌ Auth: Invalid token:",
      error instanceof Error ? error.message : error
    );
    return res.status(401).json({ error: "Invalid token" });
  }
}

export async function attachUser(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.user) return next();

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        language: user.language,
      };
      console.log("✅ User data attached with language:", user.language);
    }
  } catch (error) {
    console.error("❌ Error attaching user data:", error);
  }

  next();
}
