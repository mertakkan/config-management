import express from "express";
import { body, validationResult } from "express-validator";
import { db } from "../server.js";
import { verifyFirebaseToken, verifyApiToken } from "../middleware/auth.js";

const router = express.Router();

// Get config for mobile apps (requires API token)
router.get("/mobile", verifyApiToken, async (req, res) => {
  try {
    const country = req.query.country; // Get country from query parameter
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

    // Convert to simple key-value pairs for mobile with country-specific values
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
        // Check if there are country-specific values
        if (value.countryValues && country && value.countryValues[country]) {
          mobileConfig[key] = value.countryValues[country];
        } else {
          mobileConfig[key] = value.value;
        }
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
          countryValues: {},
        },
        supportEmail: {
          value: "support@codeway.co",
          description: "Support contact email",
          createDate: Date.now(),
          countryValues: {},
        },
        privacyPage: {
          value: "https://codeway.com/privacy_en.html",
          description: "Privacy policy page URL",
          createDate: Date.now(),
          countryValues: {},
        },
        minimumVersion: {
          value: "1.0",
          description: "Minimum required version of the app",
          createDate: Date.now(),
          countryValues: {},
        },
        latestVersion: {
          value: "2.1",
          description: "Latest version of the app",
          createDate: Date.now(),
          countryValues: {},
        },
        compressionQuality: {
          value: 0.7,
          description: "Image compression quality",
          createDate: Date.now(),
          countryValues: {},
        },
        btnText: {
          value: "Try now!",
          description: "Button text for call to action",
          createDate: Date.now(),
          countryValues: {},
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
