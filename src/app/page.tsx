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
        <section className="bg-[#0a0a0a] py-20 relative overflow-hidden">
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,168,76,0.12),transparent)]" />
          <div className="max-w-[1200px] mx-auto px-5 relative">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-[#c9a84c] uppercase tracking-widest mb-2">Our Promise</p>
              <h2 className="text-3xl font-semibold text-white">Kyun Choose Karein MaxWatches?</h2>
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
                  body: "Har watch genuine aur certified hai. Fake milne pe full refund.",
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
                  body: "PKR 5,000 se upar har order pe free delivery across Pakistan.",
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
                  body: "Manufacturing defects pe 1 saal ki warranty. Free service bhi.",
                  tag: "Free Service",
                  tagColor: "#34c759",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group relative bg-white/[0.07] hover:bg-white/[0.11] border border-white/15 hover:border-white/30 rounded-3xl p-8 transition-all duration-300 text-center"
                >
                  {/* Glow on hover */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: `0 0 40px -10px ${item.tagColor}30` }} />

                  <div className="relative">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                      style={{ background: `${item.tagColor}15`, border: `1px solid ${item.tagColor}30` }}>
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-[18px] text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-white/75 leading-relaxed mb-4">{item.body}</p>
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
              <h2 className="text-3xl font-semibold text-[#1d1d1f]">Asaan Payment Options</h2>
              <p className="text-[#6e6e73] mt-2">Pakistan ke top payment methods — safe aur fast</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">

              {/* JazzCash — brand: red #EE3124, orange accent #F7941D */}
              <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7] shadow-sm hover:shadow-lg transition-all duration-300 text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-md" style={{ background: "linear-gradient(145deg, #EE3124 0%, #c41f13 100%)" }}>
                  <div className="w-full h-full flex flex-col items-center justify-center gap-0.5">
                    {/* J logo mark */}
                    <svg viewBox="0 0 48 32" className="w-11 h-7" fill="none">
                      <text x="4" y="24" fill="white" fontSize="26" fontWeight="900" fontFamily="Arial Black, Arial" letterSpacing="-1">Jazz</text>
                    </svg>
                    <div className="bg-[#F7941D] rounded px-2 py-0.5">
                      <svg viewBox="0 0 48 14" className="w-10 h-3.5" fill="none">
                        <text x="2" y="11" fill="white" fontSize="12" fontWeight="700" fontFamily="Arial" letterSpacing="0.5">Cash</text>
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-[17px] text-[#1d1d1f] mb-1">JazzCash</h3>
                <p className="text-sm text-[#6e6e73] leading-snug">Mobile wallet se instant payment</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#16a34a] font-semibold bg-[#16a34a]/10 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                  Instant
                </div>
              </div>

              {/* EasyPaisa — brand: green #1DBF73 */}
              <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7] shadow-sm hover:shadow-lg transition-all duration-300 text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-md" style={{ background: "linear-gradient(145deg, #1DBF73 0%, #159956 100%)" }}>
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    {/* e lettermark */}
                    <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
                      <text x="7" y="36" fill="white" fontSize="38" fontWeight="900" fontFamily="Arial Black, Arial" letterSpacing="-2">e</text>
                      {/* small p */}
                      <circle cx="34" cy="22" r="7" fill="white" fillOpacity="0.3"/>
                      <text x="29" y="27" fill="white" fontSize="13" fontWeight="700" fontFamily="Arial">p</text>
                    </svg>
                  </div>
                </div>
                <h3 className="font-bold text-[17px] text-[#1d1d1f] mb-1">EasyPaisa</h3>
                <p className="text-sm text-[#6e6e73] leading-snug">Telenor wallet se secure payment</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#16a34a] font-semibold bg-[#16a34a]/10 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                  Instant
                </div>
              </div>

              {/* Cash on Delivery */}
              <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7] shadow-sm hover:shadow-lg transition-all duration-300 text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-md" style={{ background: "linear-gradient(145deg, #1d1d1f 0%, #3a3a3c 100%)" }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 48 48" className="w-11 h-11" fill="none">
                      <rect x="6" y="14" width="36" height="22" rx="4" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
                      <rect x="10" y="18" width="28" height="6" rx="2" fill="white" fillOpacity="0.5"/>
                      <circle cx="15" cy="30" r="4" fill="white" fillOpacity="0.7"/>
                      <circle cx="33" cy="30" r="4" fill="white" fillOpacity="0.7"/>
                      <rect x="20" y="28" width="8" height="4" rx="1" fill="white" fillOpacity="0.4"/>
                    </svg>
                  </div>
                </div>
                <h3 className="font-bold text-[17px] text-[#1d1d1f] mb-1">Cash on Delivery</h3>
                <p className="text-sm text-[#6e6e73] leading-snug">Delivery pe naqdhi dein — bilkul safe</p>
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
