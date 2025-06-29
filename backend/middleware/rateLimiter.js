import rateLimit from "express-rate-limit";

export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
// higher limit for mobile apps to handle production traffic
export const mobileApiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: {
    error: "API rate limit exceeded, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
