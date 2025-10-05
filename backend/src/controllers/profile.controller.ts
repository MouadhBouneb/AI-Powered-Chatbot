import type { Request, Response } from "express";
import { z } from "zod";
import { UserRepository } from "../repositories/user.repo";
import { SummaryRepository } from "../repositories/summary.repo";
import { ChatRepository } from "../repositories/chat.repo";
import { summarizeUser } from "../services/summary";

const users = new UserRepository();
const summaries = new SummaryRepository();
const chats = new ChatRepository();

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      console.error("❌ getProfile: req.user is null - authentication failed");
      return res.status(401).json({ error: "Authentication required" });
    }

    console.log("👤 Getting profile for user:", req.user.id);

    const user = await users.findById(req.user.id);
    if (!user) {
      console.error("❌ User not found:", req.user.id);
      return res.status(404).json({ error: "User not found" });
    }

    const summaryRecord = await summaries.findByUserId(req.user.id);
    const userChats = await chats.listByUser(req.user.id);

    // Return summary in user's preferred language
    let summary = null;
    if (summaryRecord) {
      const userLanguage = user.language as "en" | "ar";
      const content =
        userLanguage === "ar"
          ? summaryRecord.contentAr || summaryRecord.content
          : summaryRecord.contentEn || summaryRecord.content;

      summary = {
        id: summaryRecord.id,
        userId: summaryRecord.userId,
        language: userLanguage,
        content,
        updatedAt: summaryRecord.updatedAt,
      };
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        language: user.language,
      },
      summary,
      stats: { totalChats: userChats.length },
    });
  } catch (error) {
    console.error("❌ Error in getProfile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const prefSchema = z.object({ language: z.enum(["en", "ar"]) });
export const updatePreferences = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const parsed = prefSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const user = await users.updateLanguage(req.user.id, parsed.data.language);
    res.json({ user });
  } catch (error) {
    console.error("❌ Error in updatePreferences:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const generateSummary = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const t = (req as any).t as (k: string) => string;

    console.log("🎯 Generating bilingual summary for user:", req.user.id);

    // Generate both English and Arabic summaries
    const { en, ar } = await summarizeUser(req.user.id);
    const saved = await summaries.upsert(req.user.id, en, ar);

    res.json({ summary: saved, message: t("summary_updated") });
  } catch (error) {
    console.error("❌ Error in generateSummary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
