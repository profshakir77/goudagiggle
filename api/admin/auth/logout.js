export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Set-Cookie", "adminToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
  res.json({ ok: true });
}
