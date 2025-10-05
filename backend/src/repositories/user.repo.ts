import { prisma } from "../utils/prisma";

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name?: string;
    language: string;
  }) {
    return prisma.user.create({ data });
  }

  async updateLanguage(id: string, language: "en" | "ar") {
    return prisma.user.update({ where: { id }, data: { language } });
  }
}
