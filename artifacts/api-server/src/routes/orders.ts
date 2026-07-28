import { Router } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateOrderBody, GetOrderParams } from "@workspace/api-zod";
import { adminAuth } from "../middlewares/adminAuth.js";
import { sendOrderNotificationEmail, sendCustomerStatusEmail } from "../../lib/email.js";

const router = Router();

const VALID_STATUSES = ["pending", "confirmed", "paid", "completed", "cancelled"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

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

    // Notify the business of the new order. Don't let an email failure
    // block the order from being created.
    try {
      await sendOrderNotificationEmail({
        orderNumber: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        deliveryAddress: order.deliveryAddress,
        eventDate: order.eventDate,
        total: order.total,
        specialInstructions: order.specialInstructions,
        paymentMethod: order.paymentMethod as "cod" | "card",
      });
    } catch (emailErr) {
      req.log.error({ err: emailErr }, "Failed to send business notification email");
    }

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

router.get("/", adminAuth, async (req, res) => {
  try {
    const [rows, products] = await Promise.all([
      db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)),
      db.select().from(productsTable),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));

    res.json(
      rows.map((order) => {
        const rawItems = Array.isArray(order.items) ? order.items as { productId: number; quantity: number; name?: string; price?: string }[] : [];
        const enrichedItems = rawItems.map((item) => {
          const product = productMap.get(item.productId);
          return {
            productId: item.productId,
            quantity: item.quantity,
            name: item.name ?? product?.name ?? `Product #${item.productId}`,
            price: item.price ?? product?.price ?? "0",
          };
        });
        return {
          ...order,
          items: enrichedItems,
          total: parseFloat(order.total),
          createdAt: order.createdAt.toISOString(),
        };
      })
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Failed to list orders" });
  }
});

// General status update — used by the admin dashboard's status dropdown.
// Sends the customer an email whenever the status actually changes.
router.patch("/:id/status", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const { status } = req.body as { status?: string };
    if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
      return;
    }

    const rows = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (rows.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const order = rows[0];
    if (order.status === status) {
      // No change — nothing to update, no email to send.
      res.json({
        ...order,
        total: parseFloat(order.total),
        createdAt: order.createdAt.toISOString(),
      });
      return;
    }

    const [updated] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();

    // Don't let an email failure block the status update itself.
    try {
      await sendCustomerStatusEmail(
        {
          orderNumber: updated.id,
          customerName: updated.customerName,
          customerPhone: updated.customerPhone,
          customerEmail: updated.customerEmail,
          deliveryAddress: updated.deliveryAddress,
          eventDate: updated.eventDate,
          total: updated.total,
          specialInstructions: updated.specialInstructions,
          paymentMethod: updated.paymentMethod as "cod" | "card",
        },
        status
      );
    } catch (emailErr) {
      req.log.error({ err: emailErr }, "Failed to send customer status email");
    }

    res.json({
      ...updated,
      total: parseFloat(updated.total),
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update order status");
    res.status(500).json({ error: "Failed to update order status" });
  }
});

router.patch("/:id/mark-paid", adminAuth, async (req, res) => {
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

    try {
      await sendCustomerStatusEmail(
        {
          orderNumber: updated.id,
          customerName: updated.customerName,
          customerPhone: updated.customerPhone,
          customerEmail: updated.customerEmail,
          deliveryAddress: updated.deliveryAddress,
          eventDate: updated.eventDate,
          total: updated.total,
          specialInstructions: updated.specialInstructions,
          paymentMethod: updated.paymentMethod as "cod" | "card",
        },
        "paid"
      );
    } catch (emailErr) {
      req.log.error({ err: emailErr }, "Failed to send customer status email");
    }

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
