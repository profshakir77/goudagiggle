"use strict";

const BUSINESS_EMAIL = "Goudagigglesalbany@outlook.com";
const FROM_EMAIL = "orders@goudagiggles.com";
const RESEND_API_URL = "https://api.resend.com/emails";

function formatTotal(total) {
  const num = typeof total === "string" ? parseFloat(total) : total;
  return "$" + num.toFixed(2);
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

async function sendViaResend(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error("Resend API error " + response.status + ": " + text);
  }
}

function buildBusinessEmailHtml(order) {
  const paymentLabel = order.paymentMethod === "cod" ? "Cash on Delivery (collect on arrival)" : "Card (paid online)";
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #c0392b;">🧀 New Order #${order.id}</h2>
  <p>A new order has been placed on Gouda Giggles.</p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
    <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold; width: 40%; border: 1px solid #ddd;">Order #</td><td style="padding: 10px; border: 1px solid #ddd;">${order.id}</td></tr>
    <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Customer Name</td><td style="padding: 10px; border: 1px solid #ddd;">${order.customerName}</td></tr>
    <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Phone</td><td style="padding: 10px; border: 1px solid #ddd;">${order.customerPhone}</td></tr>
    <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Email</td><td style="padding: 10px; border: 1px solid #ddd;">${order.customerEmail}</td></tr>
    <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Delivery Address</td><td style="padding: 10px; border: 1px solid #ddd;">${order.deliveryAddress}</td></tr>
    <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Event Date</td><td style="padding: 10px; border: 1px solid #ddd;">${formatDate(order.eventDate)}</td></tr>
    <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Total</td><td style="padding: 10px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: #c0392b;">${formatTotal(order.total)}</td></tr>
    <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Payment Method</td><td style="padding: 10px; border: 1px solid #ddd;">${paymentLabel}</td></tr>
    ${order.specialInstructions ? `<tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Special Instructions</td><td style="padding: 10px; border: 1px solid #ddd;">${order.specialInstructions}</td></tr>` : ""}
  </table>
  <p style="margin-top: 24px; color: #666; font-size: 13px;">This is an automated notification from Gouda Giggles.</p>
</body></html>`.trim();
}

async function sendOrderNotificationEmail(order) {
  await sendViaResend({
    from: `Gouda Giggles Orders <${FROM_EMAIL}>`,
    to: [BUSINESS_EMAIL],
    subject: `New Order #${order.id} — ${order.customerName}`,
    html: buildBusinessEmailHtml(order),
  });
}

const STATUS_COPY = {
  pending: { subject: "We've received your order", heading: "Thanks for your order!", message: "We've received your order and it's being reviewed. We'll let you know as soon as it's confirmed." },
  confirmed: { subject: "Your order is confirmed", heading: "Order confirmed 🎉", message: "Your order has been confirmed and we're getting started on it." },
  paid: { subject: "Payment received", heading: "Payment received ✅", message: "We've received your payment. Your order is now being prepared." },
  completed: { subject: "Your order is complete", heading: "Order complete 🎉", message: "Your order is complete. Thank you for choosing Gouda Giggles!" },
  cancelled: { subject: "Your order was cancelled", heading: "Order cancelled", message: "Your order has been cancelled. If this wasn't expected, please contact us." },
};

function buildCustomerStatusEmailHtml(order, status) {
  const copy = STATUS_COPY[status] || { heading: "Order status update", message: `Your order status has been updated to "${status}".` };
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #c0392b;">${copy.heading}</h2>
  <p>Hi ${order.customerName},</p>
  <p>${copy.message}</p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
    <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold; width: 40%; border: 1px solid #ddd;">Order #</td><td style="padding: 10px; border: 1px solid #ddd;">${order.id}</td></tr>
    <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Event Date</td><td style="padding: 10px; border: 1px solid #ddd;">${formatDate(order.eventDate)}</td></tr>
    <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Delivery Address</td><td style="padding: 10px; border: 1px solid #ddd;">${order.deliveryAddress}</td></tr>
    <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Total</td><td style="padding: 10px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: #c0392b;">${formatTotal(order.total)}</td></tr>
  </table>
  <p style="margin-top: 24px; color: #666; font-size: 13px;">Questions about your order? Just reply to this email.</p>
</body></html>`.trim();
}

async function sendCustomerStatusEmail(order, status) {
  const copy = STATUS_COPY[status] || { subject: "Order status update" };
  await sendViaResend({
    from: `Gouda Giggles <${FROM_EMAIL}>`,
    to: [order.customerEmail],
    subject: `${copy.subject} — Order #${order.id}`,
    html: buildCustomerStatusEmailHtml(order, status),
  });
}

module.exports = { sendOrderNotificationEmail, sendCustomerStatusEmail };
