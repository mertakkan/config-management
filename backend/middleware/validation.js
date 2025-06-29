import { body, query, validationResult } from "express-validator";

export const validateConfigUpdate = [
  body().custom((value) => {
    if (typeof value !== "object" || value === null) {
      throw new Error("Request body must be an object");
    }

    Object.entries(value).forEach(([key, val]) => {
      if (
        key.startsWith("_") ||
        ["lastModified", "lastModifiedBy", "lastModifiedByEmail"].includes(key)
      ) {
        return;
      }

      if (typeof val === "object" && val !== null) {
        if (!("value" in val)) {
          throw new Error(`Parameter ${key} must have a 'value' property`);
        }
        if (!("description" in val)) {
          throw new Error(
            `Parameter ${key} must have a 'description' property`
          );
        }
      }
    });

    return true;
  }),
];

export const validateCountryQuery = [
  query("country")
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage("Country code must be 2 characters"),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};
