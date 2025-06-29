import rateLimit from "express-rate-limit";

// Rate limiter for admin endpoints
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for mobile API (higher limit for production traffic)
export const mobileApiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // High limit for mobile apps
  message: {
    error: "API rate limit exceeded, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
