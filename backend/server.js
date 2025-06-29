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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin with service account
let app;
try {
  if (process.env.NODE_ENV === "production") {
    app = initializeApp({
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
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  process.exit(1);
}

export const db = getFirestore(app);
export const adminAuth = getAuth(app);

const server = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting
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

// 404 handler - Fixed the route pattern
server.use((req, res, next) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
server.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(isDevelopment && { stack: err.stack }),
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default server;
