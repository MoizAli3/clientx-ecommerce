"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadProductImageAction, createProductAction, updateProductAction } from "@/actions/products";
import type { Category, Product } from "@/types";
import type { ProductInput } from "@/lib/validations";
import { X } from "lucide-react";

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");

  const handleNameChange = (value: string) => {
    setName(value);
    if (!product) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    e.target.value = "";

    // Upload all files in parallel
    const results = await Promise.all(
      files.map((file) => {
        const fd = new FormData();
        fd.append("file", file);
        return uploadProductImageAction(fd);
      })
    );

    const urls: string[] = [];
    const errors: string[] = [];
    for (const res of results) {
      if (res.success) urls.push(res.data.url);
      else errors.push(res.error ?? "Upload failed");
    }
    if (urls.length) setImages((prev) => [...prev, ...urls]);
    if (errors.length) setError(errors[0]);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    const salePriceRaw = fd.get("sale_price") as string;
    const payload: ProductInput = {
      name: fd.get("name") as string,
      slug: fd.get("slug") as string,
      description: fd.get("description") as string,
      price: Number(fd.get("price")),
      sale_price: salePriceRaw ? Number(salePriceRaw) : null,
      stock: Number(fd.get("stock")),
      sku: fd.get("sku") as string,
      category_id: fd.get("category_id") as string,
      images,
      is_active: fd.get("is_active") === "true",
    };

    startTransition(async () => {
      const res = product
        ? await updateProductAction(product.id, payload)
        : await createProductAction(payload);

      if (!res.success) {
        setError(res.error ?? "Kuch galat ho gaya");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#ff3b30] text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Name + Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
            Product Name <span className="text-[#ff3b30]">*</span>
          </label>
          <input
            name="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071e3] transition-colors"
            placeholder="e.g. Nike Air Max"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
            Slug <span className="text-[#ff3b30]">*</span>
          </label>
          <input
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071e3] transition-colors font-mono"
            placeholder="nike-air-max"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
          Description <span className="text-[#ff3b30]">*</span>
        </label>
        <textarea
          name="description"
          defaultValue={product?.description}
          required
          rows={4}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071e3] transition-colors resize-none"
          placeholder="Product ka description likho..."
        />
      </div>

      {/* Price + Sale Price + Stock + SKU */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
            Price (PKR) <span className="text-[#ff3b30]">*</span>
          </label>
          <input
            name="price"
            type="number"
            min={0}
            step={1}
            defaultValue={product?.price}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071e3] transition-colors"
            placeholder="1999"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Sale Price</label>
          <input
            name="sale_price"
            type="number"
            min={0}
            step={1}
            defaultValue={product?.sale_price ?? ""}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071e3] transition-colors"
            placeholder="1499"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
            Stock <span className="text-[#ff3b30]">*</span>
          </label>
          <input
            name="stock"
            type="number"
            min={0}
            defaultValue={product?.stock ?? 0}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071e3] transition-colors"
            placeholder="50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
            SKU <span className="text-[#ff3b30]">*</span>
          </label>
          <input
            name="sku"
            defaultValue={product?.sku}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071e3] transition-colors font-mono"
            placeholder="NK-AM-001"
          />
        </div>
      </div>

      {/* Category + Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
            Category <span className="text-[#ff3b30]">*</span>
          </label>
          <select
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071e3] transition-colors bg-white"
          >
            <option value="">Category select karo</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Status</label>
          <select
            name="is_active"
            defaultValue={product !== undefined ? String(product.is_active) : "true"}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071e3] transition-colors bg-white"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Images</label>
        <div className="flex flex-wrap gap-3 mb-2">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="w-20 h-20 object-cover rounded-xl border border-[#d2d2d7]"
              />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#ff3b30] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          <label
            className={`w-20 h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
              uploading
                ? "border-[#0071e3] bg-[#0071e3]/5 pointer-events-none"
                : "border-[#d2d2d7] hover:border-[#0071e3]"
            }`}
          >
            {uploading ? (
              <>
                <svg className="animate-spin w-6 h-6 text-[#0071e3]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-[10px] text-[#0071e3] mt-1 font-medium">Uploading...</span>
              </>
            ) : (
              <>
                <span className="text-2xl text-[#6e6e73] leading-none">+</span>
                <span className="text-[10px] text-[#6e6e73] mt-1">Add Image</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>
        <p className="text-xs text-[#6e6e73]">JPG, PNG ya WebP. Max 5MB each.</p>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#f5f5f7]">
        <button
          type="submit"
          disabled={isPending || uploading}
          className="px-6 py-2.5 bg-[#0071e3] text-white text-sm font-semibold rounded-full hover:bg-[#0077ed] active:bg-[#006edb] transition-colors disabled:opacity-50 shadow-sm"
        >
          {isPending ? "Saving..." : product ? "Update Product" : "Create Product"}
        </button>
        <a
          href="/admin/products"
          className="px-5 py-2.5 text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] rounded-full hover:bg-[#e8e8ed] transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
