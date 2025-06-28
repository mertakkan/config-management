import { adminAuth } from "../server.js";

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

export const verifyApiToken = (req, res, next) => {
  const token = req.headers["x-api-token"];

  if (!token || token !== process.env.API_TOKEN) {
    return res.status(401).json({ error: "Invalid API token" });
  }

  next();
};
