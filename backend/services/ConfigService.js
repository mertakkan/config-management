import { db } from "../server.js";

class ConfigService {
  constructor() {
    this.configCache = null;
    this.cacheExpiry = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  async getDefaultConfig() {
    return {
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
  }

  async getConfigFromCache() {
    if (this.configCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      return this.configCache;
    }
    return null;
  }

  setConfigCache(config) {
    this.configCache = config;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
  }

  clearCache() {
    this.configCache = null;
    this.cacheExpiry = null;
  }

  async getConfig() {
    try {
      // Try cache first for high traffic optimization
      const cachedConfig = await this.getConfigFromCache();
      if (cachedConfig) {
        return cachedConfig;
      }

      const configDoc = await db.collection("config").doc("app_config").get();

      if (!configDoc.exists) {
        const defaultConfig = await this.getDefaultConfig();
        this.setConfigCache(defaultConfig);
        return defaultConfig;
      }

      const config = configDoc.data();
      this.setConfigCache(config);
      return config;
    } catch (error) {
      throw new Error(`Failed to fetch configuration: ${error.message}`);
    }
  }

  async updateConfig(configData, userId, userEmail) {
    try {
      const configRef = db.collection("config").doc("app_config");

      const updatedConfig = {
        ...configData,
        lastModified: Date.now(),
        lastModifiedBy: userId,
        lastModifiedByEmail: userEmail,
      };

      await configRef.set(updatedConfig);
      this.clearCache(); // Clear cache after update

      return updatedConfig;
    } catch (error) {
      throw new Error(`Failed to update configuration: ${error.message}`);
    }
  }

  async checkConcurrentModification(clientLastModified) {
    try {
      const configRef = db.collection("config").doc("app_config");
      const currentDoc = await configRef.get();

      if (
        currentDoc.exists &&
        clientLastModified &&
        currentDoc.data().lastModified !== clientLastModified
      ) {
        return true; // Conflict detected
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
        // Check for country-specific values
        if (value.countryValues && country && value.countryValues[country]) {
          mobileConfig[key] = value.countryValues[country];
        } else {
          mobileConfig[key] = value.value;
        }
      } else {
        mobileConfig[key] = value;
      }
    });

    return mobileConfig;
  }
}

export default new ConfigService();
