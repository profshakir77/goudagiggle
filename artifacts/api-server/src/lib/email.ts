const BUSINESS_EMAIL = "Goudagigglesalbany@outlook.com";
const FROM_EMAIL = "orders@goudagiggles.com";
const RESEND_API_URL = "https://api.resend.com/emails";

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

// Core sender — talks to Resend's HTTPS API directly, no Replit dependency
async function sendViaResend(payload: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend API error ${response.status}: ${text}`);
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
  const subject = data.paymentMethod === "cod"
    ? `New COD Order #${data.orderNumber} — ${data.customerName}`
    : `New Order #${data.orderNumber} — ${data.customerName}`;

  await sendViaResend({
    from: `Gouda Giggles Orders <${FROM_EMAIL}>`,
    to: [BUSINESS_EMAIL],
    subject,
    html: buildBusinessEmailHtml(data),
  });
}

// ---- Customer-facing status update emails ----

// Human-friendly copy per status. Adjust/add keys once you confirm your
// app's full status list.
const STATUS_COPY: Record<string, { subject: string; heading: string; message: string }> = {
  pending: {
    subject: "We've received your order",
    heading: "Thanks for your order!",
    message: "We've received your order and it's being reviewed. We'll let you know as soon as it's confirmed.",
  },
  paid: {
    subject: "Payment received",
    heading: "Payment received ✅",
    message: "We've received your payment. Your order is now being prepared.",
  },
  confirmed: {
    subject: "Your order is confirmed",
    heading: "Order confirmed 🎉",
    message: "Your order has been confirmed and we're getting started on it.",
  },
  preparing: {
    subject: "Your order is being prepared",
    heading: "In the kitchen 🧀",
    message: "We're preparing your order now.",
  },
  out_for_delivery: {
    subject: "Your order is on its way",
    heading: "Out for delivery 🚚",
    message: "Your order is on its way to you.",
  },
  delivered: {
    subject: "Your order has been delivered",
    heading: "Delivered! 🎉",
    message: "Your order has been delivered. Enjoy!",
  },
  cancelled: {
    subject: "Your order was cancelled",
    heading: "Order cancelled",
    message: "Your order has been cancelled. If this wasn't expected, please contact us.",
  },
};

function buildCustomerStatusEmailHtml(data: OrderEmailData, status: string): string {
  const copy = STATUS_COPY[status] ?? {
    subject: "Order status update",
    heading: "Order status update",
    message: `Your order status has been updated to "${status}".`,
  };

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #c0392b;">${copy.heading}</h2>
  <p>Hi ${data.customerName},</p>
  <p>${copy.message}</p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold; width: 40%; border: 1px solid #ddd;">Order #</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${data.orderNumber}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Event Date</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${formatDate(data.eventDate)}</td>
    </tr>
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Delivery Address</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${data.deliveryAddress}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Total</td>
      <td style="padding: 10px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: #c0392b;">${formatTotal(data.total)}</td>
    </tr>
  </table>
  <p style="margin-top: 24px; color: #666; font-size: 13px;">Questions about your order? Just reply to this email.</p>
</body>
</html>
  `.trim();
}

export async function sendCustomerStatusEmail(data: OrderEmailData, status: string): Promise<void> {
  const copy = STATUS_COPY[status] ?? { subject: "Order status update" };

  await sendViaResend({
    from: `Gouda Giggles <${FROM_EMAIL}>`,
    to: [data.customerEmail],
    subject: `${copy.subject} — Order #${data.orderNumber}`,
    html: buildCustomerStatusEmailHtml(data, status),
  });
}
