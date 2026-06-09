import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import ordersRouter from "./orders";
import quotesRouter from "./quotes";
import galleryRouter from "./gallery";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/quotes", quotesRouter);
router.use("/gallery", galleryRouter);
router.use("/stats", statsRouter);

export default router;
