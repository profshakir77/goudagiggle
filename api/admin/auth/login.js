import jwt from "jsonwebtoken";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body ?? {};
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = jwt.sign({ admin: true }, process.env.SESSION_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production";

  res.setHeader(
    "Set-Cookie",
    `adminToken=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${isProduction ? "; Secure" : ""}`,
  );
  res.json({ ok: true });
}
