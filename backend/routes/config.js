import express from "express";
import { verifyFirebaseToken, verifyApiToken } from "../middleware/auth.js";
import {
  adminRateLimit,
  mobileApiRateLimit,
} from "../middleware/rateLimiter.js";
import {
  validateConfigUpdate,
  validateCountryQuery,
  handleValidationErrors,
} from "../middleware/validation.js";
import ConfigService from "../services/ConfigService.js";

const router = express.Router();

// Get config for mobile apps (requires API token)
router.get(
  "/mobile",
  mobileApiRateLimit,
  verifyApiToken,
  validateCountryQuery,
  handleValidationErrors,
  async (req, res) => {
    try {
      const country = req.query.country?.toUpperCase();
      const config = await ConfigService.getConfig();

      if (!config) {
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

      const mobileConfig = ConfigService.transformToMobileConfig(
        config,
        country
      );
      res.json(mobileConfig);
    } catch (error) {
      console.error("Error fetching mobile config:", error);
      res.status(500).json({
        error: "Failed to fetch configuration",
        message:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Get config for admin panel
router.get("/admin", adminRateLimit, verifyFirebaseToken, async (req, res) => {
  try {
    const config = await ConfigService.getConfig();

    if (!config) {
      const defaultConfig = await ConfigService.getDefaultConfig();

      // Save default config with user info
      const savedConfig = await ConfigService.updateConfig(
        defaultConfig,
        req.user.uid,
        req.user.email
      );

      return res.json(savedConfig);
    }

    res.json(config);
  } catch (error) {
    console.error("Error fetching admin config:", error);
    res.status(500).json({
      error: "Failed to fetch configuration",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Update config (requires Firebase auth)
router.put(
  "/admin",
  adminRateLimit,
  verifyFirebaseToken,
  validateConfigUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const clientLastModified = req.body.lastModified;

      // Check for concurrent modifications
      const hasConflict = await ConfigService.checkConcurrentModification(
        clientLastModified
      );

      if (hasConflict) {
        return res.status(409).json({
          error:
            "Configuration has been modified by another user. Please refresh and try again.",
          code: "CONCURRENT_MODIFICATION",
        });
      }

      const updatedConfig = await ConfigService.updateConfig(
        req.body,
        req.user.uid,
        req.user.email
      );

      res.json(updatedConfig);
    } catch (error) {
      console.error("Error updating config:", error);
      res.status(500).json({
        error: "Failed to update configuration",
        message:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

export default router;
