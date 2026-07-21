import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout, useAdminAuth } from "@/components/admin-layout";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/admin-fetch";

type OrderItem = { productId: number; name: string; quantity: number; price: string };

type Order = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  deliveryAddress: string;
  specialInstructions: string | null;
  status: string;
  paymentMethod: string;
  total: string;
  items: OrderItem[] | unknown;
  createdAt: string;
};

const STATUSES = ["pending", "confirmed", "paid", "completed", "cancelled"];

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  paid:      "bg-green-50 text-green-700 border-green-200",
  completed: "bg-purple-50 text-purple-700 border-purple-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const PAYMENT_STYLES: Record<string, string> = {
  cod:  "bg-orange-50 text-orange-700",
  card: "bg-sky-50 text-sky-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function AdminOrders() {
  const ready = useAdminAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: () => apiFetch("/api/admin/orders"),
    enabled: ready,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiFetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const pendingCOD = orders.filter((o) => o.status === "pending" && o.paymentMethod === "cod").length;

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
            <span>{orders.length} total orders</span>
            <span>·</span>
            <span className="text-orange-600 font-medium">{pendingCOD} COD awaiting delivery</span>
            <span>·</span>
            <span className="text-green-700 font-medium">${totalRevenue.toFixed(2)} revenue</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition",
                filter === s
                  ? "bg-[#49225E] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {s} {s === "all" ? `(${orders.length})` : `(${orders.filter((o) => o.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#49225E]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-20 text-center text-gray-400">
            No orders found.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Event Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((o) => (
                    <>
                      <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{o.id}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(o.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{o.customerName}</div>
                          <div className="text-xs text-gray-400">{o.customerEmail}</div>
                          <div className="text-xs text-gray-400">{o.customerPhone}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{o.eventDate}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex px-2 py-0.5 rounded-full text-xs font-medium uppercase",
                              PAYMENT_STYLES[o.paymentMethod] ?? "bg-gray-100 text-gray-600"
                            )}
                          >
                            {o.paymentMethod === "cod" ? "Cash on Delivery" : "Card"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          ${Number(o.total).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={o.status}
                            onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                            className={cn(
                              "px-2 py-1 rounded-md text-xs font-medium border capitalize cursor-pointer focus:outline-none",
                              STATUS_STYLES[o.status] ?? "bg-gray-50 text-gray-700 border-gray-200"
                            )}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s} className="bg-white text-gray-900">{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                          >
                            {expanded === o.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded row */}
                      {expanded === o.id && (
                        <tr key={`${o.id}-detail`} className="bg-gray-50">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-700 mb-1">Delivery Address</p>
                                <p className="text-gray-600">{o.deliveryAddress}</p>
                                {o.specialInstructions && (
                                  <>
                                    <p className="font-medium text-gray-700 mt-3 mb-1">Special Instructions</p>
                                    <p className="text-gray-600">{o.specialInstructions}</p>
                                  </>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-700 mb-2">Items Ordered</p>
                                <div className="space-y-1.5">
                                  {(Array.isArray(o.items) ? o.items as OrderItem[] : []).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100">
                                      <span className="text-gray-800">
                                        <span className="font-medium">{item.quantity}×</span>{" "}
                                        {item.name || `Product #${item.productId}`}
                                      </span>
                                      <span className="text-gray-600">
                                        ${(Number(item.price) * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
