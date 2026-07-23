import { requireAdmin } from "../../_auth.js";
import { getDb, ordersTable } from "../../_db.js";
import { eq } from "drizzle-orm";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = getDb();
    const id = parseInt(req.query.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({
      ...order,
      total: parseFloat(order.total),
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
}
