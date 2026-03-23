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
        <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
          {/* Subtle radial glow */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,168,76,0.12), transparent)' }} />
          <div className="max-w-[1200px] mx-auto px-5 relative">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#c9a84c' }}>Our Promise</p>
              <h2 className="text-3xl font-semibold" style={{ color: '#ffffff' }}>Why Choose MaxWatches?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                      <path d="M20 4L6 10v10c0 8.284 5.97 16.032 14 18 8.03-1.968 14-9.716 14-18V10L20 4z" fill="#c9a84c" fillOpacity="0.15" stroke="#c9a84c" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M14 20l4 4 8-8" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                  title: "100% Authentic",
                  body: "Every watch is genuine and certified. Full refund if it's not authentic.",
                  tag: "Certified",
                  tagColor: "#c9a84c",
                },
                {
                  icon: (
                    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                      <rect x="4" y="14" width="28" height="18" rx="3" fill="#0071e3" fillOpacity="0.15" stroke="#0071e3" strokeWidth="1.5"/>
                      <path d="M8 14V11a4 4 0 018 0v3" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M28 22l6-4v12l-6-4" fill="#0071e3" fillOpacity="0.4" stroke="#0071e3" strokeWidth="1.5" strokeLinejoin="round"/>
                      <circle cx="18" cy="23" r="3" fill="#0071e3" fillOpacity="0.6"/>
                    </svg>
                  ),
                  title: "Free Delivery",
                  body: "Free delivery on every order above PKR 5,000 — across all of Pakistan.",
                  tag: "All Cities",
                  tagColor: "#0071e3",
                },
                {
                  icon: (
                    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                      <circle cx="20" cy="20" r="14" fill="#34c759" fillOpacity="0.12" stroke="#34c759" strokeWidth="1.5"/>
                      <path d="M20 10v10l6 4" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 28l-3 3M27 28l3 3" stroke="#34c759" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ),
                  title: "1 Year Warranty",
                  body: "1-year warranty on manufacturing defects. Free servicing included.",
                  tag: "Free Service",
                  tagColor: "#34c759",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group relative rounded-3xl p-8 transition-all duration-300 text-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  {/* Glow on hover */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: `0 0 40px -10px ${item.tagColor}30` }} />

                  <div className="relative">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                      style={{ background: `${item.tagColor}15`, border: `1px solid ${item.tagColor}30` }}>
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-[18px] mb-2" style={{ color: '#ffffff' }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>{item.body}</p>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: `${item.tagColor}20`, color: item.tagColor }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: item.tagColor }} />
                      {item.tag}
                    </span>
                  </div>
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
              <h2 className="text-3xl font-semibold text-[#1d1d1f]">Easy Payment Options</h2>
              <p className="text-[#6e6e73] mt-2">Pakistan&apos;s top payment methods — safe and fast</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">

              {/* JazzCash */}
              <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7] shadow-sm hover:shadow-lg transition-all duration-300 text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-md overflow-hidden" style={{ background: "linear-gradient(145deg, #EE3124 0%, #c41f13 100%)" }}>
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <span className="text-white font-black text-xl leading-none tracking-tight">Jazz</span>
                    <span className="bg-[#F7941D] text-white font-bold text-[11px] px-2 py-0.5 rounded-sm leading-none">Cash</span>
                  </div>
                </div>
                <h3 className="font-bold text-[17px] text-[#1d1d1f] mb-1">JazzCash</h3>
                <p className="text-sm text-[#6e6e73] leading-snug">Instant payment via mobile wallet</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#16a34a] font-semibold bg-[#16a34a]/10 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                  Instant
                </div>
              </div>

              {/* EasyPaisa */}
              <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7] shadow-sm hover:shadow-lg transition-all duration-300 text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-md overflow-hidden" style={{ background: "linear-gradient(145deg, #1DBF73 0%, #159956 100%)" }}>
                  <div className="w-full h-full flex flex-col items-center justify-center gap-0.5">
                    <span className="text-white font-black text-[13px] leading-none tracking-wide">easy</span>
                    <span className="text-white font-black text-[13px] leading-none tracking-wide">paisa</span>
                  </div>
                </div>
                <h3 className="font-bold text-[17px] text-[#1d1d1f] mb-1">EasyPaisa</h3>
                <p className="text-sm text-[#6e6e73] leading-snug">Secure payment via Telenor wallet</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#16a34a] font-semibold bg-[#16a34a]/10 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                  Instant
                </div>
              </div>

              {/* Cash on Delivery */}
              <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7] shadow-sm hover:shadow-lg transition-all duration-300 text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-md" style={{ background: "linear-gradient(145deg, #1d1d1f 0%, #3a3a3c 100%)" }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
                      <rect x="8" y="28" width="32" height="12" rx="3" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
                      <path d="M14 28V20a10 10 0 0 1 20 0v8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="24" cy="34" r="2.5" fill="white" fillOpacity="0.8"/>
                      <path d="M20 12h8M24 9v6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5"/>
                    </svg>
                  </div>
                </div>
                <h3 className="font-bold text-[17px] text-[#1d1d1f] mb-1">Cash on Delivery</h3>
                <p className="text-sm text-[#6e6e73] leading-snug">Pay cash when your order arrives — completely safe</p>
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
