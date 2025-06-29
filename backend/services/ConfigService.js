import { db } from "../server.js";
import { AppError } from "../utils/errorHandler.js";

class ConfigService {
  constructor() {
    // in-memory cache with ttl to reduce firestore reads under high traffic
    this.configCache = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    this.CONFIG_COLLECTION = "config";
    this.CONFIG_DOC = "app_config";
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await db.collection("_health").limit(1).get();
      this.isInitialized = true;
    } catch (error) {
      throw new AppError("Database connection failed", 500);
    }
  }

  getDefaultConfig() {
    const defaultParameters = {
      freeUsageLimit: { value: 5, description: "Maximum free usage allowed" },
      supportEmail: {
        value: "support@codeway.co",
        description: "Support contact email",
      },
      privacyPage: {
        value: "https://codeway.com/privacy_en.html",
        description: "Privacy policy page URL",
      },
      minimumVersion: {
        value: "1.0",
        description: "Minimum required version of the app",
      },
      latestVersion: { value: "2.1", description: "Latest version of the app" },
      compressionQuality: {
        value: 0.7,
        description: "Image compression quality",
      },
      btnText: {
        value: "Try now!",
        description: "Button text for call to action",
      },
    };

    const now = Date.now();
    return Object.fromEntries(
      Object.entries(defaultParameters).map(([key, { value, description }]) => [
        key,
        {
          value,
          description,
          createDate: now,
          countryValues: {},
        },
      ])
    );
  }

  getCacheKey() {
    return `${this.CONFIG_COLLECTION}:${this.CONFIG_DOC}`;
  }

  getFromCache() {
    const cacheKey = this.getCacheKey();
    const cached = this.configCache.get(cacheKey);

    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    this.configCache.delete(cacheKey); // Clean expired cache
    return null;
  }

  setCache(data) {
    const cacheKey = this.getCacheKey();
    this.configCache.set(cacheKey, {
      data: { ...data }, // Deep copy to prevent mutations
      expiry: Date.now() + this.CACHE_DURATION,
    });
  }

  clearCache() {
    this.configCache.clear();
  }

  async getConfig() {
    await this.initialize();

    try {
      // Try cache first for high traffic optimization
      const cachedConfig = this.getFromCache();
      if (cachedConfig) {
        return cachedConfig;
      }

      const configDoc = await db
        .collection(this.CONFIG_COLLECTION)
        .doc(this.CONFIG_DOC)
        .get();

      let config;
      if (!configDoc.exists) {
        config = this.getDefaultConfig();
        // Save default config for future use
        await this.saveConfigToDb(config);
      } else {
        config = configDoc.data();
      }

      this.setCache(config);
      return config;
    } catch (error) {
      throw new AppError(
        `Failed to fetch configuration: ${error.message}`,
        500
      );
    }
  }

  async saveConfigToDb(configData) {
    const configRef = db
      .collection(this.CONFIG_COLLECTION)
      .doc(this.CONFIG_DOC);

    await configRef.set(configData);
  }

  async updateConfig(configData, userId, userEmail) {
    await this.initialize();

    try {
      const updatedConfig = {
        ...configData,
        lastModified: Date.now(),
        lastModifiedBy: userId,
        lastModifiedByEmail: userEmail,
      };

      await this.saveConfigToDb(updatedConfig);
      this.clearCache();

      return updatedConfig;
    } catch (error) {
      throw new AppError(
        `Failed to update configuration: ${error.message}`,
        500
      );
    }
  }
  // prevent race conditions during concurrent config updates
  async checkConcurrentModification(clientLastModified) {
    if (!clientLastModified) {
      return false;
    }

    try {
      const configRef = db
        .collection(this.CONFIG_COLLECTION)
        .doc(this.CONFIG_DOC);
      const currentDoc = await configRef.get();

      if (
        currentDoc.exists &&
        currentDoc.data().lastModified !== clientLastModified
      ) {
        return true;
      }

      return false;
    } catch (error) {
      throw new AppError(
        `Failed to check concurrent modifications: ${error.message}`,
        500
      );
    }
  }

  // transform admin config format to mobile-friendly response
  transformToMobileConfig(config, country = null) {
    const mobileConfig = {};
    const metadataKeys = new Set([
      "_",
      "lastModified",
      "lastModifiedBy",
      "lastModifiedByEmail",
    ]);

    Object.entries(config).forEach(([key, value]) => {
      // Skip metadata
      if (metadataKeys.has(key) || key.startsWith("_")) {
        return;
      }

      if (this.isConfigParameter(value)) {
        // Check for country-specific values
        const countryValue = country && value.countryValues?.[country];
        mobileConfig[key] =
          countryValue !== undefined ? countryValue : value.value;
      } else {
        mobileConfig[key] = value;
      }
    });

    return mobileConfig;
  }

  isConfigParameter(value) {
    return typeof value === "object" && value !== null && "value" in value;
  }
}

export default new ConfigService();
