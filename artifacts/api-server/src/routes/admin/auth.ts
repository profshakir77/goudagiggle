import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { adminAuth } from "../../middlewares/adminAuth.js";

const router = Router();

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  skipSuccessfulRequests: true,
});

router.post("/login", loginRateLimit, (req: Request, res: Response) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || password !== adminPassword) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  const token = jwt.sign({ admin: true }, process.env.SESSION_SECRET!, {
    expiresIn: "7d",
  });
  res.cookie("adminToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  res.json({ ok: true });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("adminToken", { path: "/" });
  res.json({ ok: true });
});

router.get("/me", adminAuth, (_req: Request, res: Response) => {
  res.json({ admin: true });
});

export default router;
