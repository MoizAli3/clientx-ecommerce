"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-3">
          Category
        </p>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setFilter("category", null)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors",
                !activeCategory
                  ? "bg-[#1d1d1f] text-white font-medium"
                  : "text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
              )}
            >
              All
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setFilter("category", cat.slug)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors",
                  activeCategory === cat.slug
                    ? "bg-[#1d1d1f] text-white font-medium"
                    : "text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
                )}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
