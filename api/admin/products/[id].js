import { requireAdmin } from "../../_auth.js";
import { getDb, productsTable } from "../../_db.js";
import { eq } from "drizzle-orm";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const db = getDb();
  const id = parseInt(req.query.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  if (req.method === "PUT") {
    try {
      const { name, description, price, category, serves, imageUrl, inStock, featured } = req.body ?? {};
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
      if (!updated) return res.status(404).json({ error: "Product not found" });
      res.json({ ...updated, price: parseFloat(updated.price) });
    } catch (err) {
      res.status(500).json({ error: "Failed to update product" });
    }
    return;
  }

  if (req.method === "DELETE") {
    try {
      const [deleted] = await db
        .delete(productsTable)
        .where(eq(productsTable.id, id))
        .returning();
      if (!deleted) return res.status(404).json({ error: "Product not found" });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete product" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
