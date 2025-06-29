import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import configRoutes from "./routes/config.js";
import authRoutes from "./routes/auth.js";
import { authRateLimit } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// singleton pattern to prevent firebase re-initialization issues during development
class FirebaseService {
  static instance = null;

  constructor() {
    if (FirebaseService.instance) {
      return FirebaseService.instance;
    }

    this.app = null;
    this.db = null;
    this.auth = null;
    this.initializeFirebase();
    FirebaseService.instance = this;
  }

  initializeFirebase() {
    try {
      // handle both production (env vars) and development (service account file) configurations
      if (process.env.NODE_ENV === "production") {
        this.app = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      } else {
        const serviceAccount = JSON.parse(
          readFileSync(join(__dirname, "firebase-service-account.json"), "utf8")
        );
        this.app = initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      }

      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
      process.exit(1);
    }
  }

  getDB() {
    return this.db;
  }

  getAuth() {
    return this.auth;
  }
}

// Create singleton instance
const firebaseService = new FirebaseService();

// Export instances
export const db = firebaseService.getDB();
export const adminAuth = firebaseService.getAuth();

const server = express();
const PORT = process.env.PORT || 3000;

// trust proxy for accurate client ip detection in rate limiting
server.set("trust proxy", 1);

// Middleware
server.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);

server.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

if (process.env.NODE_ENV !== "test") {
  server.use(morgan("combined"));
}

server.use(express.json({ limit: "1mb" }));
server.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Routes
server.use("/api/config", configRoutes);
server.use("/api/auth", authRateLimit, authRoutes);

// Health check
server.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Error handling
server.use(notFoundHandler);
server.use(errorHandler);

// graceful shutdown handler for production deployments
const gracefulShutdown = () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default server;
