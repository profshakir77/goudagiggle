import { Router } from "express";
import { db, galleryTable } from "@workspace/db";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await db.select().from(galleryTable);
    const images = rows.map((g) => ({
      id: g.id,
      url: g.url,
      caption: g.caption,
      category: g.category,
    }));
    res.json(images);
  } catch (err) {
    req.log.error({ err }, "Failed to list gallery");
    res.status(500).json({ error: "Failed to list gallery" });
  }
});

export default router;
