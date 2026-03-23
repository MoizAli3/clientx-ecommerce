import { createClient } from "@/lib/supabase/server";
import { FadeUp } from "@/components/ui/motion";
import { formatPKR } from "@/lib/utils";
import { AdminProductActions } from "@/components/admin/AdminProductActions";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="w-full">
      <FadeUp>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">Products ({products?.length ?? 0})</h1>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1d1d1f] text-white text-sm font-semibold rounded-full hover:bg-[#3a3a3c] transition-colors shadow-sm"
          >
            <Plus size={15} /> Add Product
          </Link>
        </div>
      </FadeUp>

      <div className="bg-white rounded-2xl border border-[#d2d2d7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f5f5f7]">
                {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6e6e73] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#6e6e73]">
                    No products found — add your first product above
                  </td>
                </tr>
              )}
              {products?.map((p) => {
                const category = p.category as unknown as { name: string } | null;
                return (
                  <tr key={p.id} className="hover:bg-[#f9f9f9] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1d1d1f] line-clamp-1">{p.name}</p>
                      <p className="text-xs text-[#6e6e73]">{p.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-[#6e6e73]">{category?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{formatPKR(p.sale_price ?? p.price)}</p>
                      {p.sale_price && (
                        <p className="text-xs text-[#6e6e73] line-through">{formatPKR(p.price)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${p.stock === 0 ? "text-[#ff3b30]" : p.stock < 5 ? "text-[#ff9500]" : "text-[#34c759]"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.is_active
                          ? "bg-[#34c759] text-white"
                          : "bg-[#ff3b30] text-white"
                      }`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <AdminProductActions productId={p.id} slug={p.slug} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
