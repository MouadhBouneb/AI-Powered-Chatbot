import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repo";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export class AuthService {
  private users = new UserRepository();

  async signup(
    email: string,
    password: string,
    name?: string,
    language: "en" | "ar" = "en"
  ) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new Error("EMAIL_IN_USE");
    const passwordHash = await bcrypt.hash(password, 10);
    const userData: {
      email: string;
      passwordHash: string;
      language: string;
      name?: string;
    } = {
      email,
      passwordHash,
      language,
    };
    if (name) {
      userData.name = name;
    }
    const user = await this.users.create(userData);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        language: user.language,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new Error("INVALID_CREDENTIALS");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error("INVALID_CREDENTIALS");
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        language: user.language,
      },
    };
  }
}
