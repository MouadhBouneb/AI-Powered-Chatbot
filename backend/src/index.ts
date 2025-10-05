import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { i18n, i18nMiddleware } from "./middleware/i18n";
import { errorHandler } from "./middleware/errorHandler";
import { cacheService } from "./services/cache.service";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import profileRoutes from "./routes/profile.routes";
import modelsRoutes from "./routes/models.routes";

async function startServer() {
  const app = express();

  // Initialize cache service
  await cacheService.connect();

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use(i18nMiddleware.handle(i18n));
  app.use(rateLimit({ windowMs: 60_000, max: 60 }));

  // Cache middleware for static responses
  app.use((req, res, next) => {
    if (req.method === "GET" && req.path.startsWith("/api/")) {
      res.set("Cache-Control", "public, max-age=300"); // 5 minutes cache
    }
    next();
  });

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/models", modelsRoutes);

  app.use(errorHandler);

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    await cacheService.disconnect();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down gracefully");
    await cacheService.disconnect();
    process.exit(0);
  });
}

// Start the server
startServer().catch(console.error);
