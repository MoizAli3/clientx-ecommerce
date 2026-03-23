"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function ProductSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultValue ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md">
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aeaeb2] pointer-events-none"
      />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Watch khojo... (e.g. "chronograph", "gold", "smart")'
        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none transition-all text-[15px] placeholder:text-[#aeaeb2]"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors"
        >
          <X size={15} />
        </button>
      )}
    </form>
  );
}
