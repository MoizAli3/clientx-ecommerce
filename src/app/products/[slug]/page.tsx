import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/supabase/queries";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductDetail } from "@/components/products/ProductDetail";
import { ProductCard } from "@/components/products/ProductCard";
import { StaggerList, FadeUp } from "@/components/ui/motion";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const { products: related } = await getProducts({
    categorySlug: product.category?.slug,
    limit: 4,
  });
  const others = related.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <>
      <Navbar />
      <main>
        <div className="max-w-[1200px] mx-auto px-5 py-10">
          <ProductDetail product={product} />
        </div>

        {others.length > 0 && (
          <section className="max-w-[1200px] mx-auto px-5 py-12 border-t border-[#d2d2d7]">
            <FadeUp>
              <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] mb-8">
                Related Products
              </h2>
            </FadeUp>
            <StaggerList className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {others.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </StaggerList>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
