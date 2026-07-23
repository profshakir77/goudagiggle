import { getDb, productsTable } from "../_db.js";
import { sql } from "drizzle-orm";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const db = getDb();

    const [{ count }] = await db
      .select({ count: sql`count(*)::int` })
      .from(productsTable);

    const categories = await db
      .selectDistinct({ category: productsTable.category })
      .from(productsTable);

    const [{ minPrice }] = await db
      .select({ minPrice: sql`min(price)` })
      .from(productsTable);

    res.json({
      totalProducts: count,
      categories: categories.length,
      startingPrice: minPrice ? parseFloat(minPrice) : 45,
      happyCustomers: 500,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get stats" });
  }
}
