import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/supabase/queries";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Product } from "@/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const adminSupabase = await createAdminClient();
  const [{ data: product }, categories] = await Promise.all([
    adminSupabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("slug", slug)
      .single(),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/products"
          className="p-1.5 text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white rounded-xl transition-colors border border-transparent hover:border-[#d2d2d7]"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">Edit Product</h1>
          <p className="text-sm text-[#6e6e73]">{product.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#d2d2d7] p-6">
        <ProductForm categories={categories} product={product as Product} />
      </div>
    </div>
  );
}
