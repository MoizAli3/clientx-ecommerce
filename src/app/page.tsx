import Link from "next/link";
import { getProducts, getCategories } from "@/lib/supabase/queries";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { StaggerList } from "@/components/ui/motion";

export const revalidate = 60;

export default async function HomePage() {
  const [{ products }, categories] = await Promise.all([
    getProducts({ limit: 8 }),
    getCategories(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <CategoryGrid categories={categories} />

        {/* Featured Watches */}
        <section className="max-w-[1200px] mx-auto px-5 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-medium text-[#c9a84c] mb-1 uppercase tracking-wider">
                New Arrivals
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
                Featured Timepieces
              </h2>
            </div>
            <Link
              href="/products"
              className="text-[#0071e3] text-[15px] hover:underline hidden md:block"
            >
              View all →
            </Link>
          </div>

          <StaggerList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </StaggerList>

          <div className="mt-8 text-center md:hidden">
            <Link href="/products" className="text-[#0071e3] text-[15px] hover:underline">
              View all watches →
            </Link>
          </div>
        </section>

        {/* Brand promise banner */}
        <section className="bg-[#0a0a0a] py-16">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "🛡️", title: "100% Authentic", body: "Har watch genuine aur certified hai. Fake milne pe full refund." },
                { icon: "🚚", title: "Free Delivery", body: "PKR 5,000 se upar har order pe free delivery across Pakistan." },
                { icon: "🔧", title: "1 Year Warranty", body: "Manufacturing defects pe 1 saal ki warranty. Free service bhi." },
              ].map((item) => (
                <div key={item.title} className="text-center py-4">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-[17px] text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ReviewsSection />

        {/* Payment methods */}
        <section className="bg-[#f5f5f7] py-16">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-[#c9a84c] uppercase tracking-widest mb-2">Secure Checkout</p>
              <h2 className="text-3xl font-semibold text-[#1d1d1f]">Asaan Payment Options</h2>
              <p className="text-[#6e6e73] mt-2">Pakistan ke top payment methods — safe aur fast</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {/* JazzCash */}
              <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7] shadow-sm hover:shadow-md transition-shadow text-center">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" }}
                >
                  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
                    <circle cx="24" cy="24" r="20" fill="white" fillOpacity="0.2"/>
                    <path d="M14 32 Q24 20 34 32" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <circle cx="24" cy="18" r="5" fill="white" fillOpacity="0.9"/>
                    <text x="24" y="38" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="Arial">JAZZ</text>
                  </svg>
                </div>
                <h3 className="font-bold text-[17px] text-[#1d1d1f] mb-1">JazzCash</h3>
                <p className="text-sm text-[#6e6e73] leading-snug">Mobile wallet se instant payment</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#16a34a] font-semibold bg-[#16a34a]/10 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                  Instant
                </div>
              </div>

              {/* EasyPaisa */}
              <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7] shadow-sm hover:shadow-md transition-shadow text-center">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)" }}
                >
                  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
                    <circle cx="24" cy="24" r="20" fill="white" fillOpacity="0.2"/>
                    <path d="M13 28 L24 14 L35 28" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="18" y="28" width="12" height="8" rx="2" fill="white" fillOpacity="0.85"/>
                    <text x="24" y="39" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="7" fontWeight="900" fontFamily="Arial">EASY</text>
                  </svg>
                </div>
                <h3 className="font-bold text-[17px] text-[#1d1d1f] mb-1">EasyPaisa</h3>
                <p className="text-sm text-[#6e6e73] leading-snug">Telenor wallet se secure payment</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#16a34a] font-semibold bg-[#16a34a]/10 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                  Instant
                </div>
              </div>

              {/* Cash on Delivery */}
              <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7] shadow-sm hover:shadow-md transition-shadow text-center">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #1d1d1f 0%, #3a3a3c 100%)" }}
                >
                  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
                    <rect x="8" y="16" width="32" height="20" rx="4" fill="white" fillOpacity="0.2"/>
                    <rect x="12" y="20" width="24" height="5" rx="1.5" fill="white" fillOpacity="0.6"/>
                    <circle cx="18" cy="30" r="3.5" fill="white" fillOpacity="0.8"/>
                    <circle cx="30" cy="30" r="3.5" fill="white" fillOpacity="0.8"/>
                  </svg>
                </div>
                <h3 className="font-bold text-[17px] text-[#1d1d1f] mb-1">Cash on Delivery</h3>
                <p className="text-sm text-[#6e6e73] leading-snug">Delivery pe cash dein — no risk</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#c9a84c] font-semibold bg-[#c9a84c]/10 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
                  Most Popular
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-[#aeaeb2] mt-8">
              🔒 All transactions are 100% secure and encrypted
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
