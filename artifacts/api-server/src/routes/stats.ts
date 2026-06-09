import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable);

    const categories = await db
      .selectDistinct({ category: productsTable.category })
      .from(productsTable);

    const [{ minPrice }] = await db
      .select({ minPrice: sql<string>`min(price)` })
      .from(productsTable);

    res.json({
      totalProducts: count,
      categories: categories.length,
      startingPrice: minPrice ? parseFloat(minPrice) : 45,
      happyCustomers: 500,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;
