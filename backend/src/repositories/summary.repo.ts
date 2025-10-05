import { prisma } from "../utils/prisma";

export class SummaryRepository {
  async findByUserId(userId: string) {
    return prisma.userSummary.findUnique({ where: { userId } });
  }

  async upsert(userId: string, contentEn: string, contentAr: string) {
    return prisma.userSummary.upsert({
      where: { userId },
      update: {
        contentEn,
        contentAr,
        content: contentEn, // Keep for backward compatibility
        language: "en", // Default to en for backward compatibility
      },
      create: {
        userId,
        contentEn,
        contentAr,
        content: contentEn, // Keep for backward compatibility
        language: "en", // Default to en for backward compatibility
      },
    });
  }
}
