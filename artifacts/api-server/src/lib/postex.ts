const POSTEX_BASE_URL = "https://api.postex.pk/services/integration/api/order";

function getToken(): string {
  const token = process.env.POSTEX_API_TOKEN;
  if (!token) throw new Error("POSTEX_API_TOKEN is not set");
  return token;
}

export interface PostExCreateOrderInput {
  orderRefNumber: string;
  invoicePayment: number;
  orderDetail?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  cityName: string;
  items: number;
  transactionNotes?: string;
}

export async function createPostExOrder(input: PostExCreateOrderInput) {
  const res = await fetch(`${POSTEX_BASE_URL}/v3/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: getToken(),
    },
    body: JSON.stringify({
      cityName: input.cityName,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      deliveryAddress: input.deliveryAddress,
      invoiceDivision: 1,
      invoicePayment: input.invoicePayment,
      items: input.items,
      orderDetail: input.orderDetail ?? "",
      orderRefNumber: input.orderRefNumber,
      orderType: "Normal",
      transactionNotes: input.transactionNotes ?? "",
    }),
  });

  const data = await res.json();
  if (!res.ok || data.statusCode !== "200") {
    throw new Error(`PostEx create order failed: ${data.statusMessage ?? res.statusText}`);
  }
  return data.dist as { trackingNumber: string; orderStatus: string; orderDate: string };
}

export async function trackPostExOrder(trackingNumber: string) {
  const res = await fetch(`${POSTEX_BASE_URL}/v1/track-order/${trackingNumber}`, {
    headers: { token: getToken() },
  });
  const data = await res.json();
  if (!res.ok || data.statusCode !== "200") {
    throw new Error(`PostEx track order failed: ${data.statusMessage ?? res.statusText}`);
  }
  return data.dist;
}

export async function cancelPostExOrder(trackingNumber: string) {
  const res = await fetch(`${POSTEX_BASE_URL}/v1/cancel-order`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      token: getToken(),
    },
    body: JSON.stringify({ trackingNumber }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`PostEx cancel order failed: ${data.statusMessage ?? res.statusText}`);
  }
  return true;
}
