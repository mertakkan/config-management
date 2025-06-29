export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleAsyncError = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createErrorResponse = (error, isDevelopment = false) => {
  const response = {
    error: error.message || "Internal server error",
    ...(error.code && { code: error.code }),
  };

  if (isDevelopment && error.stack) {
    response.stack = error.stack;
  }

  return response;
};
