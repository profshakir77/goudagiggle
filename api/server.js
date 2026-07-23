"use strict";
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const { eq, desc, and, sql } = require("drizzle-orm");
const { getDb, productsTable, ordersTable, galleryTable, quotesTable } = require("./_db.js");

const app = express();
app.use(express.json());
app.use(cookieParser());

// ─── Auth helper ────────────────────────────────────────────────────────────
function requireAdmin(req, res) {
  const token = req.cookies && req.cookies.adminToken;
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return false; }
  try {
    jwt.verify(token, process.env.SESSION_SECRET);
    return true;
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
}

// ─── Health ──────────────────────────────────────────────────────────────────
app.get("/api/health", function(_req, res) { res.json({ status: "ok" }); });

// ─── Stats ───────────────────────────────────────────────────────────────────
app.get("/api/stats", async function(_req, res) {
  try {
    const db = getDb();
    const [{ count }] = await db.select({ count: sql`count(*)::int` }).from(productsTable);
    const categories = await db.selectDistinct({ category: productsTable.category }).from(productsTable);
    const [{ minPrice }] = await db.select({ minPrice: sql`min(price)` }).from(productsTable);
    res.json({ totalProducts: count, categories: categories.length, startingPrice: minPrice ? parseFloat(minPrice) : 45, happyCustomers: 500 });
  } catch (err) { res.status(500).json({ error: "Failed to get stats" }); }
});

// ─── Gallery ─────────────────────────────────────────────────────────────────
app.get("/api/gallery", async function(_req, res) {
  try {
    const db = getDb();
    const rows = await db.select().from(galleryTable);
    res.json(rows.map(function(g) { return { id: g.id, url: g.url, caption: g.caption, category: g.category }; }));
  } catch (err) { res.status(500).json({ error: "Failed to list gallery" }); }
});

// ─── Quotes ──────────────────────────────────────────────────────────────────
app.post("/api/quotes", async function(req, res) {
  try {
    const db = getDb();
    const { name, email, phone, eventType, eventDate, guestCount, message } = req.body || {};
    if (!name || !email || !phone || !eventType || !eventDate || !guestCount || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const [quote] = await db.insert(quotesTable).values({ name, email, phone, eventType, eventDate, guestCount: parseInt(guestCount, 10), message }).returning();
    res.status(201).json(Object.assign({}, quote, { createdAt: quote.createdAt.toISOString() }));
  } catch (err) { res.status(500).json({ error: "Failed to create quote" }); }
});

// ─── Products ─────────────────────────────────────────────────────────────────
app.get("/api/products/featured", async function(_req, res) {
  try {
    const db = getDb();
    const rows = await db.select().from(productsTable).where(and(eq(productsTable.featured, true), eq(productsTable.inStock, true)));
    res.json(rows.map(function(p) { return Object.assign({}, p, { price: parseFloat(p.price) }); }));
  } catch (err) { res.status(500).json({ error: "Failed to get featured products" }); }
});

app.get("/api/products", async function(req, res) {
  try {
    const db = getDb();
    const { category } = req.query;
    const rows = category
      ? await db.select().from(productsTable).where(eq(productsTable.category, category))
      : await db.select().from(productsTable);
    res.json(rows.map(function(p) { return Object.assign({}, p, { price: parseFloat(p.price) }); }));
  } catch (err) { res.status(500).json({ error: "Failed to list products" }); }
});

app.get("/api/products/:id", async function(req, res) {
  try {
    const db = getDb();
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid product id" });
    const [p] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!p) return res.status(404).json({ error: "Product not found" });
    res.json(Object.assign({}, p, { price: parseFloat(p.price) }));
  } catch (err) { res.status(500).json({ error: "Failed to get product" }); }
});

// ─── Orders (public) ─────────────────────────────────────────────────────────
app.post("/api/orders", async function(req, res) {
  try {
    const db = getDb();
    const data = req.body;
    if (!data.customerName || !data.customerEmail || !Array.isArray(data.items)) {
      return res.status(400).json({ error: "Invalid order data" });
    }
    let totalCents = 0;
    for (const item of data.items) {
      const [p] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
      if (p) totalCents += Math.round(parseFloat(p.price) * 100) * item.quantity;
    }
    const [order] = await db.insert(ordersTable).values({
      customerName: data.customerName, customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || "", eventDate: data.eventDate || "",
      deliveryAddress: data.deliveryAddress || "", specialInstructions: data.specialInstructions || null,
      status: "pending", paymentMethod: "cod", total: (totalCents / 100).toFixed(2), items: data.items,
    }).returning();
    res.status(201).json(Object.assign({}, order, { total: parseFloat(order.total), createdAt: order.createdAt.toISOString() }));
  } catch (err) { res.status(500).json({ error: "Failed to create order" }); }
});

app.get("/api/orders/:id", async function(req, res) {
  try {
    const db = getDb();
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid order id" });
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(Object.assign({}, order, { total: parseFloat(order.total), createdAt: order.createdAt.toISOString() }));
  } catch (err) { res.status(500).json({ error: "Failed to get order" }); }
});

// ─── Payments ─────────────────────────────────────────────────────────────────
app.post("/api/payments", async function(req, res) {
  try {
    const db = getDb();
    const data = req.body;
    if (!data.customerName || !data.customerEmail || !Array.isArray(data.items) || !data.items.length) {
      return res.status(400).json({ error: "Invalid payment data" });
    }
    const paymentMethod = data.paymentMethod || "card";
    let totalCents = 0;
    for (const item of data.items) {
      const [p] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
      if (!p) return res.status(400).json({ error: "Product not found: " + item.productId });
      if (!p.inStock) return res.status(400).json({ error: "Product is out of stock: " + p.name });
      totalCents += Math.round(parseFloat(p.price) * 100) * item.quantity;
    }
    if (paymentMethod === "cod") {
      const [order] = await db.insert(ordersTable).values({
        customerName: data.customerName, customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || "", eventDate: data.eventDate || "",
        deliveryAddress: data.deliveryAddress || "", specialInstructions: data.specialInstructions || null,
        status: "pending", paymentMethod: "cod", total: (totalCents / 100).toFixed(2), items: data.items,
      }).returning();
      return res.status(201).json(Object.assign({}, order, { total: parseFloat(order.total), createdAt: order.createdAt.toISOString() }));
    }
    if (!data.sourceId) return res.status(400).json({ error: "sourceId is required for card payments" });
    const locationId = process.env.SQUARE_LOCATION_ID;
    if (!locationId) return res.status(500).json({ error: "Square location not configured" });
    // Square SDK v44: SquareClient + payments.create() — response is { payment: {...} }
    const { SquareClient, SquareEnvironment } = require("square");
    const squareEnv = process.env.SQUARE_ENVIRONMENT === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox;
    const client = new SquareClient({ token: process.env.SQUARE_ACCESS_TOKEN, environment: squareEnv });
    const paymentResult = await client.payments.create({
      sourceId: data.sourceId, idempotencyKey: randomUUID(),
      amountMoney: { amount: BigInt(totalCents), currency: "USD" },
      locationId, note: "Gouda Giggles order for " + data.customerName, buyerEmailAddress: data.customerEmail,
    });
    if (!paymentResult.payment || paymentResult.payment.status !== "COMPLETED") {
      return res.status(402).json({ error: "Payment was not completed" });
    }
    const [order] = await db.insert(ordersTable).values({
      customerName: data.customerName, customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || "", eventDate: data.eventDate || "",
      deliveryAddress: data.deliveryAddress || "", specialInstructions: data.specialInstructions || null,
      status: "paid", paymentMethod: "card", total: (totalCents / 100).toFixed(2), items: data.items,
    }).returning();
    res.status(201).json(Object.assign({}, order, { total: parseFloat(order.total), createdAt: order.createdAt.toISOString(), squarePaymentId: paymentResult.payment.id }));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Payment failed" });
  }
});

// ─── Admin Auth ───────────────────────────────────────────────────────────────
app.post("/api/admin/auth/login", function(req, res) {
  const body = req.body || {};
  const password = body.password;
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }
  const secret = process.env.SESSION_SECRET;
  if (!secret) return res.status(500).json({ error: "Server misconfigured" });
  const token = jwt.sign({ admin: true }, secret, { expiresIn: "7d" });
  res.cookie("adminToken", token, {
    httpOnly: true, secure: true, sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, path: "/",
  });
  res.json({ ok: true });
});

app.post("/api/admin/auth/logout", function(_req, res) {
  res.clearCookie("adminToken", { path: "/" });
  res.json({ ok: true });
});

app.get("/api/admin/auth/me", function(req, res) {
  if (!requireAdmin(req, res)) return;
  res.json({ admin: true });
});

// ─── Admin Orders ─────────────────────────────────────────────────────────────
app.get("/api/admin/orders", async function(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    const db = getDb();
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    res.json(orders.map(function(o) { return Object.assign({}, o, { total: parseFloat(o.total), createdAt: o.createdAt.toISOString() }); }));
  } catch (err) { res.status(500).json({ error: "Failed to fetch orders" }); }
});

app.get("/api/admin/orders/:id", async function(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    const db = getDb();
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(Object.assign({}, order, { total: parseFloat(order.total), createdAt: order.createdAt.toISOString() }));
  } catch (err) { res.status(500).json({ error: "Failed to fetch order" }); }
});

app.patch("/api/admin/orders/:id/status", async function(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    const db = getDb();
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const VALID = ["pending", "confirmed", "paid", "completed", "cancelled"];
    const status = (req.body || {}).status;
    if (!VALID.includes(status)) return res.status(400).json({ error: "Status must be one of: " + VALID.join(", ") });
    const [updated] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Order not found" });
    res.json(Object.assign({}, updated, { total: parseFloat(updated.total), createdAt: updated.createdAt.toISOString() }));
  } catch (err) { res.status(500).json({ error: "Failed to update order status" }); }
});

// ─── Admin Products ───────────────────────────────────────────────────────────
app.get("/api/admin/products", async function(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    const db = getDb();
    const products = await db.select().from(productsTable).orderBy(productsTable.id);
    res.json(products.map(function(p) { return Object.assign({}, p, { price: parseFloat(p.price) }); }));
  } catch (err) { res.status(500).json({ error: "Failed to fetch products" }); }
});

app.post("/api/admin/products", async function(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    const db = getDb();
    const { name, description, price, category, serves, imageUrl, inStock, featured } = req.body || {};
    if (!name || !description || !price || !category) return res.status(400).json({ error: "name, description, price, category are required" });
    const [product] = await db.insert(productsTable).values({ name, description, price: String(price), category, serves: serves || null, imageUrl: imageUrl || null, inStock: inStock !== false, featured: featured === true }).returning();
    res.status(201).json(Object.assign({}, product, { price: parseFloat(product.price) }));
  } catch (err) { res.status(500).json({ error: "Failed to create product" }); }
});

app.put("/api/admin/products/:id", async function(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    const db = getDb();
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const { name, description, price, category, serves, imageUrl, inStock, featured } = req.body || {};
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = String(price);
    if (category !== undefined) updates.category = category;
    if (serves !== undefined) updates.serves = serves || null;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl || null;
    if (inStock !== undefined) updates.inStock = inStock;
    if (featured !== undefined) updates.featured = featured;
    const [updated] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(Object.assign({}, updated, { price: parseFloat(updated.price) }));
  } catch (err) { res.status(500).json({ error: "Failed to update product" }); }
});

app.patch("/api/admin/products/:id/stock", async function(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    const db = getDb();
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const inStock = Boolean((req.body || {}).inStock);
    const [updated] = await db.update(productsTable).set({ inStock }).where(eq(productsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(Object.assign({}, updated, { price: parseFloat(updated.price) }));
  } catch (err) { res.status(500).json({ error: "Failed to update stock" }); }
});

app.delete("/api/admin/products/:id", async function(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    const db = getDb();
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: "Failed to delete product" }); }
});

module.exports = app;
