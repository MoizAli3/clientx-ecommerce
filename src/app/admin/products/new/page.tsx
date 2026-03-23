import { getCategories } from "@/lib/supabase/queries";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/products"
          className="p-1.5 text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white rounded-xl transition-colors border border-transparent hover:border-[#d2d2d7]"
        >
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-semibold text-[#1d1d1f]">Add Product</h1>
      </div>

      <div className="bg-white rounded-2xl border border-[#d2d2d7] p-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
