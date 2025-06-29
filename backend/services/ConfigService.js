import { db } from "../server.js";

class ConfigService {
  constructor() {
    this.configCache = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    this.CONFIG_COLLECTION = "config";
    this.CONFIG_DOC = "app_config";
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

    return null;
  }

  setCache(data) {
    const cacheKey = this.getCacheKey();
    this.configCache.set(cacheKey, {
      data,
      expiry: Date.now() + this.CACHE_DURATION,
    });
  }

  clearCache() {
    this.configCache.clear();
  }

  async getConfig() {
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
      } else {
        config = configDoc.data();
      }

      this.setCache(config);
      return config;
    } catch (error) {
      throw new Error(`Failed to fetch configuration: ${error.message}`);
    }
  }

  async updateConfig(configData, userId, userEmail) {
    try {
      const configRef = db
        .collection(this.CONFIG_COLLECTION)
        .doc(this.CONFIG_DOC);

      const updatedConfig = {
        ...configData,
        lastModified: Date.now(),
        lastModifiedBy: userId,
        lastModifiedByEmail: userEmail,
      };

      await configRef.set(updatedConfig);
      this.clearCache();

      return updatedConfig;
    } catch (error) {
      throw new Error(`Failed to update configuration: ${error.message}`);
    }
  }

  async checkConcurrentModification(clientLastModified) {
    try {
      if (!clientLastModified) {
        return false;
      }

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
      throw new Error(
        `Failed to check concurrent modifications: ${error.message}`
      );
    }
  }

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
        mobileConfig[key] = countryValue || value.value;
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
