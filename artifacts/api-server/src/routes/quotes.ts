import { Router } from "express";
import { db, quotesTable } from "@workspace/db";
import { CreateQuoteBody } from "@workspace/api-zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const parsed = CreateQuoteBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid quote data", details: parsed.error.issues });
      return;
    }

    const data = parsed.data;
    const [quote] = await db
      .insert(quotesTable)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        eventType: data.eventType,
        eventDate: data.eventDate,
        guestCount: data.guestCount,
        message: data.message,
      })
      .returning();

    res.status(201).json({
      ...quote,
      createdAt: quote.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create quote");
    res.status(500).json({ error: "Failed to create quote" });
  }
});

export default router;
