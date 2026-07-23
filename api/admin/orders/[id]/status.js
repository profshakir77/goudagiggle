import { requireAdmin } from "../../../_auth.js";
import { getDb, ordersTable } from "../../../_db.js";
import { eq } from "drizzle-orm";

const VALID_STATUSES = ["pending", "confirmed", "paid", "completed", "cancelled"];

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = getDb();
    const id = parseInt(req.query.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const { status } = req.body ?? {};
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    const [updated] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Order not found" });

    res.json({
      ...updated,
      total: parseFloat(updated.total),
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status" });
  }
}
