import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ListProductsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListProductsQueryParams.safeParse(req.query);
    const category = query.success ? query.data.category : undefined;

    const rows = category
      ? await db.select().from(productsTable).where(eq(productsTable.category, category))
      : await db.select().from(productsTable);

    const products = rows.map((p) => ({
      ...p,
      price: parseFloat(p.price),
    }));

    res.json(products);
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    res.status(500).json({ error: "Failed to list products" });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.featured, true), eq(productsTable.inStock, true)));

    const products = rows.map((p) => ({
      ...p,
      price: parseFloat(p.price),
    }));

    res.json(products);
  } catch (err) {
    req.log.error({ err }, "Failed to get featured products");
    res.status(500).json({ error: "Failed to get featured products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid product id" });
      return;
    }

    const rows = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const p = rows[0];
    res.json({ ...p, price: parseFloat(p.price) });
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Failed to get product" });
  }
});

export default router;
