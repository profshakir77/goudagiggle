import { Router, type IRouter } from "express";
import { Readable } from "stream";
import healthRouter from "./health";
import productsRouter from "./products";
import ordersRouter from "./orders";
import quotesRouter from "./quotes";
import galleryRouter from "./gallery";
import statsRouter from "./stats";
import paymentsRouter from "./payments";
import adminRouter from "./admin/index.js";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage.js";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

router.use(healthRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/quotes", quotesRouter);
router.use("/gallery", galleryRouter);
router.use("/stats", statsRouter);
router.use("/payments", paymentsRouter);
router.use("/admin", adminRouter);

// Public object serving — for uploaded product images
router.get("/storage/objects/*path", async (req, res) => {
  try {
    const raw = req.params.path as string | string[];
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
    const response = await objectStorageService.downloadObject(objectFile, 3600);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
