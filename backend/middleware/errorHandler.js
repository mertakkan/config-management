import { createErrorResponse } from "../utils/errorHandler.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Server Error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === "development";

  const errorResponse = createErrorResponse(err, isDevelopment);

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
};
