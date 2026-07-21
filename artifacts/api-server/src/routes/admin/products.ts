import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import { adminAuth } from "../../middlewares/adminAuth.js";

const router = Router();

// All product admin routes require auth
router.use(adminAuth);

// GET /admin/products — list all products
router.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .orderBy(productsTable.id);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST /admin/products — create product
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, serves, imageUrl, inStock, featured } = req.body;
    if (!name || !description || !price || !category) {
      res.status(400).json({ error: "name, description, price, category are required" });
      return;
    }
    const [product] = await db
      .insert(productsTable)
      .values({
        name,
        description,
        price: String(price),
        category,
        serves: serves || null,
        imageUrl: imageUrl || null,
        inStock: inStock !== false,
        featured: featured === true,
      })
      .returning();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /admin/products/:id — update product
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const { name, description, price, category, serves, imageUrl, inStock, featured } = req.body;
    const [updated] = await db
      .update(productsTable)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: String(price) }),
        ...(category !== undefined && { category }),
        ...(serves !== undefined && { serves: serves || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(inStock !== undefined && { inStock }),
        ...(featured !== undefined && { featured }),
      })
      .where(eq(productsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// PATCH /admin/products/:id/stock — toggle in-stock
router.patch("/:id/stock", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const { inStock } = req.body;
    const [updated] = await db
      .update(productsTable)
      .set({ inStock: Boolean(inStock) })
      .where(eq(productsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update stock" });
  }
});

// DELETE /admin/products/:id — delete product
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [deleted] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
