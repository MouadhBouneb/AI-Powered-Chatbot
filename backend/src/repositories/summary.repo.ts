import { prisma } from "../utils/prisma";

export class SummaryRepository {
  async findByUserId(userId: string) {
    return prisma.userSummary.findUnique({ where: { userId } });
  }

  async upsert(
    userId: string,
    contentEn: string,
    contentAr: string,
    userLanguage: string = "en"
  ) {
    return prisma.userSummary.upsert({
      where: { userId },
      update: {
        contentEn,
        contentAr,
        content: userLanguage === "ar" ? contentAr : contentEn, // Dynamic based on user language
        language: userLanguage, // Dynamic based on user language
      },
      create: {
        userId,
        contentEn,
        contentAr,
        content: userLanguage === "ar" ? contentAr : contentEn, // Dynamic based on user language
        language: userLanguage, // Dynamic based on user language
      },
    });
  }
}
