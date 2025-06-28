import express from "express";
import { body, validationResult } from "express-validator";
import { db } from "../server.js";
import { verifyFirebaseToken, verifyApiToken } from "../middleware/auth.js";

const router = express.Router();

// Get config for mobile apps (requires API token)
router.get("/mobile", verifyApiToken, async (req, res) => {
  try {
    const configDoc = await db.collection("config").doc("app_config").get();

    if (!configDoc.exists) {
      const defaultConfig = {
        freeUsageLimit: 5,
        supportEmail: "support@codeway.co",
        privacyPage: "https://codeway.com/privacy_en.html",
        minimumVersion: "1.0",
        latestVersion: "2.1",
        compressionQuality: 0.7,
        btnText: "Try now!",
      };
      return res.json(defaultConfig);
    }

    const config = configDoc.data();

    // Convert to simple key-value pairs for mobile
    const mobileConfig = {};
    Object.entries(config).forEach(([key, value]) => {
      if (
        key.startsWith("_") ||
        key === "lastModified" ||
        key === "lastModifiedBy" ||
        key === "lastModifiedByEmail"
      ) {
        return; // Skip metadata
      }

      if (typeof value === "object" && value !== null && "value" in value) {
        mobileConfig[key] = value.value;
      } else {
        mobileConfig[key] = value;
      }
    });

    res.json(mobileConfig);
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({ error: "Failed to fetch configuration" });
  }
});

// Get config for admin panel
router.get("/admin", verifyFirebaseToken, async (req, res) => {
  try {
    const configDoc = await db.collection("config").doc("app_config").get();

    if (!configDoc.exists) {
      const defaultConfig = {
        freeUsageLimit: {
          value: 5,
          description: "Maximum free usage allowed",
          createDate: Date.now(),
        },
        supportEmail: {
          value: "support@codeway.co",
          description: "Support contact email",
          createDate: Date.now(),
        },
        privacyPage: {
          value: "https://codeway.com/privacy_en.html",
          description: "Privacy policy page URL",
          createDate: Date.now(),
        },
        minimumVersion: {
          value: "1.0",
          description: "Minimum required version of the app",
          createDate: Date.now(),
        },
        latestVersion: {
          value: "2.1",
          description: "Latest version of the app",
          createDate: Date.now(),
        },
        compressionQuality: {
          value: 0.7,
          description: "Image compression quality",
          createDate: Date.now(),
        },
        btnText: {
          value: "Try now!",
          description: "Button text for call to action",
          createDate: Date.now(),
        },
      };

      // Save default config
      await db
        .collection("config")
        .doc("app_config")
        .set({
          ...defaultConfig,
          lastModified: Date.now(),
          lastModifiedBy: req.user.uid,
          lastModifiedByEmail: req.user.email,
        });

      return res.json({
        ...defaultConfig,
        lastModified: Date.now(),
      });
    }

    res.json(configDoc.data());
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({ error: "Failed to fetch configuration" });
  }
});

// Update config (requires Firebase auth)
router.put("/admin", verifyFirebaseToken, async (req, res) => {
  try {
    const configRef = db.collection("config").doc("app_config");

    // Check for concurrent modifications
    const currentDoc = await configRef.get();
    const clientLastModified = req.body.lastModified;

    if (
      currentDoc.exists &&
      clientLastModified &&
      currentDoc.data().lastModified !== clientLastModified
    ) {
      return res.status(409).json({
        error:
          "Configuration has been modified by another user. Please refresh and try again.",
      });
    }

    const updatedConfig = {
      ...req.body,
      lastModified: Date.now(),
      lastModifiedBy: req.user.uid,
      lastModifiedByEmail: req.user.email,
    };

    await configRef.set(updatedConfig);
    res.json(updatedConfig);
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({ error: "Failed to update configuration" });
  }
});

export default router;
