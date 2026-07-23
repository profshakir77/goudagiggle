import { requireAdmin } from "../../_auth.js";
import { getDb, productsTable } from "../../_db.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const db = getDb();

  if (req.method === "GET") {
    try {
      const products = await db.select().from(productsTable).orderBy(productsTable.id);
      res.json(products.map((p) => ({ ...p, price: parseFloat(p.price) })));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const { name, description, price, category, serves, imageUrl, inStock, featured } = req.body ?? {};
      if (!name || !description || !price || !category) {
        return res.status(400).json({ error: "name, description, price, category are required" });
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
      res.status(201).json({ ...product, price: parseFloat(product.price) });
    } catch (err) {
      res.status(500).json({ error: "Failed to create product" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
