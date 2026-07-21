import { Router, type Request, type Response } from "express";
import { ObjectStorageService } from "../../lib/objectStorage.js";
import { adminAuth } from "../../middlewares/adminAuth.js";

const router = Router();
const objectStorageService = new ObjectStorageService();

// POST /admin/storage/request-url — get presigned upload URL (admin only)
router.post("/request-url", adminAuth, async (req: Request, res: Response) => {
  try {
    const { name, size, contentType } = req.body;
    if (!name || !contentType) {
      res.status(400).json({ error: "name and contentType are required" });
      return;
    }
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
    res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
  } catch (err) {
    req.log.error({ err }, "Error generating upload URL");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

export default router;
