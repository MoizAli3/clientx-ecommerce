"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deleteProductAction } from "@/actions/products";

export function AdminProductActions({ productId, slug }: { productId: string; slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Is product ko delete karna chahte ho?")) return;
    setLoading(true);
    const res = await deleteProductAction(productId);
    if (!res.success) {
      alert(res.error ?? "Delete nahi ho saka");
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/admin/products/${slug}/edit`}
        className="p-1.5 text-[#6e6e73] hover:text-[#0071e3] hover:bg-[#f5f5f7] rounded-lg transition-colors"
      >
        <Pencil size={14} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 text-[#6e6e73] hover:text-[#ff3b30] hover:bg-[#f5f5f7] rounded-lg transition-colors disabled:opacity-40"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
