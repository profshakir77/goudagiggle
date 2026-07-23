import { requireAdmin } from "../../../_auth.js";
import { getDb, productsTable } from "../../../_db.js";
import { eq } from "drizzle-orm";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = getDb();
    const id = parseInt(req.query.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const { inStock } = req.body ?? {};
    const [updated] = await db
      .update(productsTable)
      .set({ inStock: Boolean(inStock) })
      .where(eq(productsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json({ ...updated, price: parseFloat(updated.price) });
  } catch (err) {
    res.status(500).json({ error: "Failed to update stock" });
  }
}
