export const errorHandler = (err, req, res, next) => {
  console.error("Server Error:", err.stack);

  // Default error response
  let error = {
    message: err.message || "Internal server error",
    status: err.status || 500,
  };

  // Handle specific error types
  if (err.name === "ValidationError") {
    error.status = 400;
    error.message = "Validation failed";
  }

  if (err.name === "UnauthorizedError") {
    error.status = 401;
    error.message = "Unauthorized";
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(error.status).json({
    error: error.message,
    ...(isDevelopment && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
};
