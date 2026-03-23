import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white mt-0">
      <div className="max-w-[1200px] mx-auto px-5 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-xl font-semibold mb-2">MaxWatch</p>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Pakistan ka number 1 premium watch store. Authentic timepieces, fast delivery.
            </p>
            <div className="flex gap-3">
              {["FB", "IG", "WA"].map((s) => (
                <div key={s} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-semibold text-white/70 hover:bg-white/20 cursor-pointer transition-colors">
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-white/40 mb-4 uppercase tracking-wider">Shop</p>
            <ul className="space-y-2.5">
              {[
                ["All Watches", "/products"],
                ["Luxury Watches", "/products?category=luxury-watches"],
                ["Sports Watches", "/products?category=sports-watches"],
                ["Smart Watches", "/products?category=smart-watches"],
                ["Ladies Watches", "/products?category=ladies-watches"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-white/40 mb-4 uppercase tracking-wider">Account</p>
            <ul className="space-y-2.5">
              {[
                ["Sign In", "/auth/login"],
                ["Register", "/auth/register"],
                ["My Orders", "/orders"],
                ["Profile", "/profile"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-white/40 mb-4 uppercase tracking-wider">Payment</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span className="w-8 h-5 bg-[#28a745] rounded text-white text-[10px] font-bold flex items-center justify-center">JC</span>
                JazzCash
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span className="w-8 h-5 bg-[#7b2d8b] rounded text-white text-[10px] font-bold flex items-center justify-center">EP</span>
                EasyPaisa
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span className="w-8 h-5 bg-white/20 rounded text-white text-[10px] font-bold flex items-center justify-center">COD</span>
                Cash on Delivery
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/30 mb-1">Shipping</p>
              <p className="text-xs text-white/50">Free above PKR 5,000</p>
              <p className="text-xs text-white/50">All cities Pakistan</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} MaxWatch. All rights reserved. Pakistan 🇵🇰
          </p>
          <p className="text-xs text-white/30">
            100% Authentic · 1 Year Warranty · Secure Checkout
          </p>
        </div>
      </div>
    </footer>
  );
}
