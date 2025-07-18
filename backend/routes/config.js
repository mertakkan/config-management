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
import { handleAsyncError, AppError } from "../utils/errorHandler.js";
import ConfigService from "../services/ConfigService.js";

const router = express.Router();

router.get(
  "/mobile",
  mobileApiRateLimit,
  verifyApiToken,
  validateCountryQuery,
  handleValidationErrors,
  handleAsyncError(async (req, res) => {
    const country = req.query.country?.toUpperCase();
    const config = await ConfigService.getConfig();

    const mobileConfig = ConfigService.transformToMobileConfig(config, country);

    res.json(mobileConfig);
  })
);

router.get(
  "/admin",
  adminRateLimit,
  verifyFirebaseToken,
  handleAsyncError(async (req, res) => {
    const config = await ConfigService.getConfig();
    res.json(config);
  })
);

router.put(
  "/admin",
  adminRateLimit,
  verifyFirebaseToken,
  validateConfigUpdate,
  handleValidationErrors,
  handleAsyncError(async (req, res) => {
    const clientLastModified = req.body.lastModified;

    // check for concurrent modifications before updating
    const hasConflict = await ConfigService.checkConcurrentModification(
      clientLastModified
    );

    if (hasConflict) {
      // throw specific error for concurrent modification detection
      throw new AppError(
        "Configuration has been modified by another user. Please refresh and try again.",
        409,
        "CONCURRENT_MODIFICATION"
      );
    }

    const updatedConfig = await ConfigService.updateConfig(
      req.body,
      req.user.uid,
      req.user.email
    );

    res.json(updatedConfig);
  })
);

export default router;
