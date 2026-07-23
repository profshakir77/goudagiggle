import { getDb, quotesTable } from "../_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const db = getDb();
    const { name, email, phone, eventType, eventDate, guestCount, message } = req.body ?? {};

    if (!name || !email || !phone || !eventType || !eventDate || !guestCount || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [quote] = await db
      .insert(quotesTable)
      .values({
        name,
        email,
        phone,
        eventType,
        eventDate,
        guestCount: parseInt(guestCount, 10),
        message,
      })
      .returning();

    res.status(201).json({
      ...quote,
      createdAt: quote.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create quote" });
  }
}
