import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/verify", verifyFirebaseToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      uid: req.user.uid,
      email: req.user.email,
    },
  });
});

export default router;
