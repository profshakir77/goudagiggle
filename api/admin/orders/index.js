import { requireAdmin } from "../../_auth.js";
import { getDb, ordersTable } from "../../_db.js";
import { desc } from "drizzle-orm";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = getDb();
    const orders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt));
    res.json(orders.map((o) => ({
      ...o,
      total: parseFloat(o.total),
      createdAt: o.createdAt.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}
