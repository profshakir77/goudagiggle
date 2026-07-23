import { getDb, galleryTable } from "../_db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const db = getDb();
    const rows = await db.select().from(galleryTable);
    res.json(rows.map((g) => ({
      id: g.id,
      url: g.url,
      caption: g.caption,
      category: g.category,
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to list gallery" });
  }
}
