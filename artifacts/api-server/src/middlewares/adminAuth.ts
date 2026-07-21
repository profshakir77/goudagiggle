import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.adminToken;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    jwt.verify(token, process.env.SESSION_SECRET!);
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
