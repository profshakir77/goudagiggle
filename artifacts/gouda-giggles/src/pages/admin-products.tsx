import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout, useAdminAuth } from "@/components/admin-layout";
import { Plus, Pencil, Trash2, ImageUp, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Charcuterie Board",
  "Grab & Go",
  "Charcuterie Cups",
  "Fruit Platters",
  "Add-Ons",
];

type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  serves: string | null;
  imageUrl: string | null;
  inStock: boolean;
  featured: boolean;
};

function getImageSrc(imageUrl: string | null): string {
  if (!imageUrl) return "/images/cat-charcuterie-board.webp";
  if (imageUrl.startsWith("/objects/")) return `/api/storage${imageUrl}`;
  return imageUrl;
}

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: CATEGORIES[0],
  serves: "",
  imageUrl: "",
  inStock: true,
  featured: false,
};

export default function AdminProducts() {
  const ready = useAdminAuth();
  const qc = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: () => apiFetch("/api/admin/products"),
    enabled: ready,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editing) {
        return apiFetch(`/api/admin/products/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      return apiFetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      closeModal();
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, inStock }: { id: number; inStock: boolean }) =>
      apiFetch(`/api/admin/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setDeleteConfirm(null);
    },
  });

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setUploadState("idle");
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      serves: p.serves ?? "",
      imageUrl: p.imageUrl ?? "",
      inStock: p.inStock,
      featured: p.featured,
    });
    setUploadState("idle");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setUploadState("idle");
  }

  async function handleImageUpload(file: File) {
    setUploadState("uploading");
    try {
      const meta = await apiFetch("/api/admin/storage/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      await fetch(meta.uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      setForm((f) => ({ ...f, imageUrl: meta.objectPath }));
      setUploadState("done");
    } catch {
      setUploadState("error");
    }
  }

  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.length - inStockCount;

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {products.length} total · {inStockCount} in stock · {outOfStockCount} out of stock
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#49225E] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#49225E]/90 transition"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#49225E]" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-16">Image</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Serves</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Featured</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">In Stock</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <img
                          src={getImageSrc(p.imageUrl)}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{p.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        ${Number(p.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.serves ?? "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-block w-2 h-2 rounded-full",
                            p.featured ? "bg-amber-400" : "bg-gray-200"
                          )}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => stockMutation.mutate({ id: p.id, inStock: !p.inStock })}
                          className={cn(
                            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                            p.inStock ? "bg-green-500" : "bg-gray-300"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
                              p.inStock ? "translate-x-4.5" : "translate-x-0.5"
                            )}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#49225E] hover:bg-purple-50 transition"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {deleteConfirm === p.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteMutation.mutate(p.id)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded-md"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-md"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(p.id)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(form);
              }}
              className="px-6 py-5 space-y-4"
            >
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#49225E]/40 focus:border-[#49225E]"
                  placeholder="e.g. Small Charcuterie Board"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#49225E]/40 focus:border-[#49225E] resize-none"
                  placeholder="Describe the product..."
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#49225E]/40 focus:border-[#49225E]"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#49225E]/40 focus:border-[#49225E] bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__custom">+ Add new category…</option>
                  </select>
                </div>
              </div>

              {/* Custom category input */}
              {form.category === "__custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Category Name *</label>
                  <input
                    required
                    value=""
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#49225E]/40 focus:border-[#49225E]"
                    placeholder="e.g. Dessert Boards"
                    autoFocus
                  />
                </div>
              )}

              {/* Serves */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serves</label>
                <input
                  value={form.serves}
                  onChange={(e) => setForm((f) => ({ ...f, serves: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#49225E]/40 focus:border-[#49225E]"
                  placeholder="e.g. 2-5 guests"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                {form.imageUrl && (
                  <img
                    src={getImageSrc(form.imageUrl)}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 mb-2"
                  />
                )}
                <div className="flex items-center gap-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadState === "uploading"}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    {uploadState === "uploading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageUp className="h-4 w-4" />
                    )}
                    {uploadState === "uploading" ? "Uploading…" : "Upload Image"}
                  </button>
                  {uploadState === "done" && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
                    </span>
                  )}
                  {uploadState === "error" && (
                    <span className="flex items-center gap-1 text-xs text-red-600">
                      <XCircle className="h-3.5 w-3.5" /> Upload failed
                    </span>
                  )}
                  <span className="text-xs text-gray-400">or</span>
                  <input
                    value={form.imageUrl.startsWith("/objects/") ? "" : form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#49225E]/40 focus:border-[#49225E]"
                    placeholder="Paste image URL"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
                    className="w-4 h-4 accent-[#49225E]"
                  />
                  <span className="text-sm font-medium text-gray-700">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="w-4 h-4 accent-[#49225E]"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured on Homepage</span>
                </label>
              </div>

              {saveMutation.error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {(saveMutation.error as Error).message}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-4 py-2 text-sm font-medium bg-[#49225E] text-white rounded-lg hover:bg-[#49225E]/90 disabled:opacity-60 transition"
                >
                  {saveMutation.isPending ? "Saving…" : editing ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
