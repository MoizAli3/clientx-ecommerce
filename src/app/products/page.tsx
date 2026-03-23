import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/supabase/queries";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { StaggerList, FadeUp } from "@/components/ui/motion";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductSearch } from "@/components/products/ProductSearch";

interface SearchParams {
  category?: string;
  search?: string;
  page?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const limit = 12;
  const offset = (page - 1) * limit;

  const [{ products, count }, categories] = await Promise.all([
    getProducts({
      categorySlug: params.category,
      search: params.search,
      limit,
      offset,
    }),
    getCategories(),
  ]);

  const totalPages = Math.ceil(count / limit);
  const activeCategoryName = categories.find((c) => c.slug === params.category)?.name;

  return (
    <>
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-5 py-10">
        <FadeUp>
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
              {params.search
                ? `"${params.search}" results`
                : activeCategoryName ?? "All Watches"}
            </h1>
            <p className="text-sm text-[#6e6e73] mt-1">{count} watches found</p>
          </div>

          {/* Search bar */}
          <Suspense>
            <ProductSearch defaultValue={params.search} />
          </Suspense>
        </FadeUp>

        <div className="flex flex-col md:flex-row gap-8 mt-8">
          {/* Sidebar filters */}
          <aside className="md:w-52 shrink-0">
            <Suspense>
              <ProductFilters categories={categories} />
            </Suspense>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-xl font-medium text-[#1d1d1f] mb-2">No watches found</p>
                <p className="text-[#6e6e73]">Try a different search or filter</p>
              </div>
            ) : (
              <>
                <StaggerList className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </StaggerList>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1;
                      const sp = new URLSearchParams();
                      if (params.category) sp.set("category", params.category);
                      if (params.search) sp.set("search", params.search);
                      sp.set("page", String(p));
                      return (
                        <a
                          key={p}
                          href={`/products?${sp.toString()}`}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            p === page
                              ? "bg-[#1d1d1f] text-white"
                              : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                          }`}
                        >
                          {p}
                        </a>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
