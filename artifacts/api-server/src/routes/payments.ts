import { Router } from "express";
import { Client, Environment } from "square";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreatePaymentBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

function getSquareClient() {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const env = process.env.SQUARE_ENVIRONMENT === "production"
    ? Environment.Production
    : Environment.Sandbox;
  return new Client({ accessToken: token, environment: env });
}

router.post("/", async (req, res) => {
  try {
    const parsed = CreatePaymentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payment data", details: parsed.error.issues });
      return;
    }

    const data = parsed.data;
    const paymentMethod = data.paymentMethod ?? "card";

    // Calculate total from DB prices (never trust client)
    let totalCents = 0;
    for (const item of data.items) {
      const rows = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
      if (rows.length > 0) {
        totalCents += Math.round(parseFloat(rows[0].price) * 100) * item.quantity;
      }
    }

    if (paymentMethod === "cod") {
      // Cash on Delivery — skip Square, create order as pending/unpaid
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
          paymentMethod: "cod",
          total: (totalCents / 100).toFixed(2),
          items: data.items,
        })
        .returning();

      res.status(201).json({
        ...order,
        total: parseFloat(order.total),
        createdAt: order.createdAt.toISOString(),
      });
      return;
    }

    // Card payment — existing Square flow
    if (!data.sourceId) {
      res.status(400).json({ error: "sourceId is required for card payments" });
      return;
    }

    const locationId = process.env.SQUARE_LOCATION_ID;
    if (!locationId) {
      res.status(500).json({ error: "Square location not configured" });
      return;
    }

    const client = getSquareClient();

    const paymentResult = await client.paymentsApi.createPayment({
      sourceId: data.sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(totalCents),
        currency: "USD",
      },
      locationId,
      note: `Gouda Giggles order for ${data.customerName}`,
      buyerEmailAddress: data.customerEmail,
    });

    if (paymentResult.result.payment?.status !== "COMPLETED") {
      res.status(402).json({ error: "Payment was not completed" });
      return;
    }

    const squarePaymentId = paymentResult.result.payment.id;

    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        eventDate: data.eventDate,
        deliveryAddress: data.deliveryAddress,
        specialInstructions: data.specialInstructions ?? null,
        status: "paid",
        paymentMethod: "card",
        total: (totalCents / 100).toFixed(2),
        items: data.items,
      })
      .returning();

    res.status(201).json({
      ...order,
      total: parseFloat(order.total),
      createdAt: order.createdAt.toISOString(),
      squarePaymentId,
    });
  } catch (err: unknown) {
    req.log.error({ err }, "Payment failed");
    const message = err instanceof Error ? err.message : "Payment failed";
    res.status(500).json({ error: message });
  }
});

export default router;
