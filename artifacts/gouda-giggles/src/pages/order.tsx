import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, CreditCard, Lock } from "lucide-react";

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<{
        card: () => Promise<{
          attach: (selector: string) => Promise<void>;
          tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>;
        }>;
      }>;
    };
  }
}

const orderSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number is required"),
  eventDate: z.string().min(1, "Date is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  specialInstructions: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

declare const __SQUARE_APP_ID__: string;
declare const __SQUARE_LOCATION_ID__: string;
declare const __SQUARE_ENVIRONMENT__: string;

const SQUARE_APP_ID = __SQUARE_APP_ID__.trim();
const SQUARE_LOCATION_ID = __SQUARE_LOCATION_ID__.trim();
const SQUARE_ENVIRONMENT = __SQUARE_ENVIRONMENT__.trim();
const SQUARE_JS_URL = SQUARE_ENVIRONMENT === "production"
  ? "https://web.squarecdn.com/v1/square.js"
  : "https://sandbox.web.squarecdn.com/v1/square.js";

export default function OrderPage() {
  const [, setLocation] = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [cardReady, setCardReady] = useState(false);
  const cardRef = useRef<{ tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }> } | null>(null);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      eventDate: "",
      deliveryAddress: "",
      specialInstructions: "",
    },
  });

  useEffect(() => {
    if (items.length === 0) return;

    let mounted = true;

    async function loadSquareScript(): Promise<void> {
      // Remove any Square script loaded from the wrong URL (e.g. production vs sandbox)
      const wrongScript = document.querySelector(`script[src*="squarecdn.com"]:not([src="${SQUARE_JS_URL}"])`);
      if (wrongScript) {
        wrongScript.remove();
        delete (window as { Square?: unknown }).Square;
      }

      if (window.Square) return;

      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${SQUARE_JS_URL}"]`);
        if (existing) {
          // Script already injected — wait for it if still loading
          if (window.Square) { resolve(); return; }
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", reject);
          return;
        }
        const script = document.createElement("script");
        script.src = SQUARE_JS_URL;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    async function initSquare() {
      try {
        await loadSquareScript();
        if (!window.Square || !mounted) return;
        const payments = await window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
        const card = await payments.card();
        await card.attach("#card-container");
        if (mounted) {
          cardRef.current = card;
          setCardReady(true);
        }
      } catch (err) {
        console.error("Failed to initialize Square card:", err);
      }
    }

    initSquare();
    return () => { mounted = false; };
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) {
      setLocation("/cart");
    }
  }, [items.length, setLocation]);

  if (items.length === 0) {
    return null;
  }

  const onSubmit = async (data: OrderFormValues) => {
    if (!cardRef.current) {
      setPaymentError("Payment form not ready. Please refresh and try again.");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const result = await cardRef.current.tokenize();

      if (result.status !== "OK" || !result.token) {
        const msg = result.errors?.[0]?.message ?? "Card tokenization failed";
        setPaymentError(msg);
        setIsProcessing(false);
        return;
      }

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: result.token,
          ...data,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? "Payment failed");
      }

      const order = await response.json();
      clearCart();
      setLocation(`/order-confirmation/${order.id}`);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="font-serif text-4xl font-bold text-primary mb-2 text-center">Complete Your Order</h1>
      <p className="text-center text-muted-foreground mb-10 flex items-center justify-center gap-2">
        <Lock className="h-4 w-4" /> Secured by Square
      </p>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        <div className="md:col-span-2 space-y-6">
          {/* Delivery Details */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold mb-6">Delivery Details</h2>

            <Form {...form}>
              <form id="order-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="jane@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event / Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, Hoboken, NJ 07030" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Allergies, gate codes, etc."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          {/* Payment Section */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold mb-2 flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-primary" /> Payment
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Your card details are encrypted and processed securely by Square.</p>

            {/* Square card element mounts here */}
            <div
              id="card-container"
              className="min-h-[90px] rounded-xl border border-border bg-background p-3"
            />

            {!cardReady && (
              <p className="text-xs text-muted-foreground mt-2 animate-pulse">Loading payment form...</p>
            )}

            {paymentError && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {paymentError}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span>256-bit SSL encryption. We never store your card details.</span>
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            form="order-form"
            size="lg"
            className="w-full h-14 text-lg rounded-xl"
            disabled={isProcessing || !cardReady}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Processing payment...
              </span>
            ) : (
              `Pay $${subtotal.toFixed(2)}`
            )}
          </Button>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-secondary/50 rounded-2xl p-6 sticky top-28 border border-primary/10">
            <h3 className="font-serif text-xl font-bold mb-4">Order Summary</h3>
            <div className="space-y-4 mb-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex-1 pr-4">
                    {item.quantity}× {item.product.name}
                  </span>
                  <span className="font-medium text-foreground">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-primary">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <span>Payments processed securely by Square. Your card info is never stored on our servers.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
