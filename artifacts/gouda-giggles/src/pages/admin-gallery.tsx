import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout, useAdminAuth } from "@/components/admin-layout";
import { Plus, Trash2, ImageUp, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/admin-fetch";

const CATEGORIES = ["Boards", "Grazing Tables", "Workshops", "Dessert Boards"];

type GalleryImage = {
  id: number;
  url: string;
  caption: string;
  category: string;
};

const emptyForm = {
  url: "",
  caption: "",
  category: CATEGORIES[0],
};

export default function AdminGallery() {
  const ready = useAdminAuth();
  const qc = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["admin-gallery"],
    queryFn: () => apiFetch("/api/admin/gallery"),
    enabled: ready,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) =>
      apiFetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      qc.invalidateQueries({ queryKey: ["/api/gallery"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/admin/gallery/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      qc.invalidateQueries({ queryKey: ["/api/gallery"] });
      setDeleteConfirm(null);
    },
  });

  function openAdd() {
    setForm(emptyForm);
    setUploadState("idle");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setUploadState("idle");
  }

  async function handleImageUpload(file: File) {
    setUploadState("uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { url } = await apiFetch("/api/admin/storage/upload", {
        method: "POST",
        body: formData,
      });
      setForm((f) => ({ ...f, url }));
      setUploadState("done");
    } catch {
      setUploadState("error");
    }
  }

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
            <p className="text-sm text-gray-500 mt-0.5">{images.length} photos</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#49225E] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#49225E]/90 transition"
          >
            <Plus className="h-4 w-4" />
            Add Photo
          </button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#49225E]" />
          </div>
        ) : images.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-20 text-center text-gray-500 text-sm">
            No gallery photos yet. Click "Add Photo" to upload one.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden group relative"
              >
                <img src={img.url} alt={img.caption} className="w-full h-36 object-cover" />
                <div className="p-3">
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium mb-1.5">
                    {img.category}
                  </span>
                  <p className="text-xs text-gray-600 line-clamp-2">{img.caption}</p>
                </div>
                <div className="absolute top-2 right-2">
                  {deleteConfirm === img.id ? (
                    <div className="flex items-center gap-1 bg-white rounded-lg shadow-md p-1">
                      <button
                        onClick={() => deleteMutation.mutate(img.id)}
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
                      onClick={() => setDeleteConfirm(img.id)}
                      className="p-1.5 rounded-lg bg-white/90 text-gray-500 hover:text-red-600 shadow-md opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Add Photo</h2>
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
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo *</label>
                {form.url && (
                  <img
                    src={form.url}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200 mb-2"
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
                    {uploadState === "uploading" ? "Uploading…" : "Upload Photo"}
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
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption *</label>
                <input
                  required
                  value={form.caption}
                  onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#49225E]/40 focus:border-[#49225E]"
                  placeholder="e.g. Grand grazing table for a wedding reception"
                />
              </div>

              {/* Category */}
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

              {/* Custom category input */}
              {form.category === "__custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Category Name *</label>
                  <input
                    required
                    value=""
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#49225E]/40 focus:border-[#49225E]"
                    placeholder="e.g. Corporate Events"
                    autoFocus
                  />
                </div>
              )}

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
                  disabled={saveMutation.isPending || !form.url}
                  className="px-4 py-2 text-sm font-medium bg-[#49225E] text-white rounded-lg hover:bg-[#49225E]/90 disabled:opacity-60 transition"
                >
                  {saveMutation.isPending ? "Saving…" : "Add Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
