import { Router } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateOrderBody, GetOrderParams } from "@workspace/api-zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const parsed = CreateOrderBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid order data", details: parsed.error.issues });
      return;
    }

    const data = parsed.data;

    // Calculate total from products
    let total = 0;
    for (const item of data.items) {
      const rows = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
      if (rows.length > 0) {
        total += parseFloat(rows[0].price) * item.quantity;
      }
    }

    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        eventDate: data.eventDate,
        deliveryAddress: data.deliveryAddress,
        specialInstructions: data.specialInstructions ?? null,
        status: "pending",
        total: total.toFixed(2),
        items: data.items,
      })
      .returning();

    res.status(201).json({
      ...order,
      total: parseFloat(order.total),
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/", async (req, res) => {
  try {
    const rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    res.json(
      rows.map((order) => ({
        ...order,
        total: parseFloat(order.total),
        createdAt: order.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Failed to list orders" });
  }
});

router.patch("/:id/mark-paid", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const rows = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (rows.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const order = rows[0];
    if (order.paymentMethod !== "cod") {
      res.status(400).json({ error: "Only Cash on Delivery orders can be marked as paid this way" });
      return;
    }
    if (order.status === "paid") {
      res.status(400).json({ error: "Order is already marked as paid" });
      return;
    }

    const [updated] = await db
      .update(ordersTable)
      .set({ status: "paid" })
      .where(eq(ordersTable.id, id))
      .returning();

    res.json({
      ...updated,
      total: parseFloat(updated.total),
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to mark order as paid");
    res.status(500).json({ error: "Failed to mark order as paid" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const params = GetOrderParams.safeParse({ id: parseInt(req.params.id, 10) });
    if (!params.success) {
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const rows = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
    if (rows.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const order = rows[0];
    res.json({
      ...order,
      total: parseFloat(order.total),
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get order" );
    res.status(500).json({ error: "Failed to get order" });
  }
});

export default router;
