import { Router, type IRouter } from "express";
import authRouter from "./auth.js";
import productsRouter from "./products.js";
import ordersRouter from "./orders.js";
import storageRouter from "./storage.js";

const router: IRouter = Router();

router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/storage", storageRouter);

export default router;
