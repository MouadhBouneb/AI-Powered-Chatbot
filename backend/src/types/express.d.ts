// Extend Express Request type to include user property
import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        language: string;
      };
    }
  }
}
