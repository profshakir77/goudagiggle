import { ReplitConnectors } from "@replit/connectors-sdk";

const BUSINESS_EMAIL = "Goudagigglesalbany@outlook.com";
const FROM_EMAIL = "orders@goudagiggles.com";

interface OrderEmailData {
  orderNumber: number | string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  eventDate: string;
  total: string | number;
  specialInstructions?: string | null;
  paymentMethod: "cod" | "card";
}

function formatTotal(total: string | number): string {
  const num = typeof total === "string" ? parseFloat(total) : total;
  return `$${num.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function buildBusinessEmailHtml(data: OrderEmailData): string {
  const paymentLabel = data.paymentMethod === "cod" ? "Cash on Delivery (collect on arrival)" : "Card (paid online)";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #c0392b;">🧀 New ${data.paymentMethod === "cod" ? "COD " : ""}Order #${data.orderNumber}</h2>
  <p>A new order has been placed on Gouda Giggles. Details below:</p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold; width: 40%; border: 1px solid #ddd;">Order #</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${data.orderNumber}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Customer Name</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${data.customerName}</td>
    </tr>
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Phone</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${data.customerPhone}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Email</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${data.customerEmail}</td>
    </tr>
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Delivery Address</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${data.deliveryAddress}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Event Date</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${formatDate(data.eventDate)}</td>
    </tr>
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Total</td>
      <td style="padding: 10px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: #c0392b;">${formatTotal(data.total)}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Payment Method</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${paymentLabel}</td>
    </tr>
    ${data.specialInstructions ? `
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Special Instructions</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${data.specialInstructions}</td>
    </tr>` : ""}
  </table>
  ${data.paymentMethod === "cod" ? `
  <div style="margin-top: 20px; padding: 12px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
    <strong>⚠️ COD Order — Payment to be collected on delivery.</strong>
  </div>` : ""}
  <p style="margin-top: 24px; color: #666; font-size: 13px;">This is an automated notification from Gouda Giggles.</p>
</body>
</html>
  `.trim();
}

export async function sendOrderNotificationEmail(data: OrderEmailData): Promise<void> {
  const connectors = new ReplitConnectors();

  const subject = data.paymentMethod === "cod"
    ? `New COD Order #${data.orderNumber} — ${data.customerName}`
    : `New Order #${data.orderNumber} — ${data.customerName}`;

  const emailPayload = {
    from: `Gouda Giggles Orders <${FROM_EMAIL}>`,
    to: [BUSINESS_EMAIL],
    subject,
    html: buildBusinessEmailHtml(data),
  };

  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    body: JSON.stringify(emailPayload),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend API error ${response.status}: ${text}`);
  }
}
