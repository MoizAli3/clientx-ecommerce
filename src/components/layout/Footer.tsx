"use client";

import Link from "next/link";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="text-white mt-0" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-[1200px] mx-auto px-5 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-xl font-semibold mb-2">MaxWatch</p>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Pakistan&apos;s #1 premium watch store. Authentic timepieces, fast delivery.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} onMouseOver={e => (e.currentTarget.style.backgroundColor='#1877F2')} onMouseOut={e => (e.currentTarget.style.backgroundColor='rgba(255,255,255,0.1)')}>
                <FaFacebook size={15} color="white" />
              </a>
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} onMouseOver={e => (e.currentTarget.style.backgroundColor='#E1306C')} onMouseOut={e => (e.currentTarget.style.backgroundColor='rgba(255,255,255,0.1)')}>
                <FaInstagram size={15} color="white" />
              </a>
              <a href="#" aria-label="WhatsApp" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} onMouseOver={e => (e.currentTarget.style.backgroundColor='#25D366')} onMouseOut={e => (e.currentTarget.style.backgroundColor='rgba(255,255,255,0.1)')}>
                <FaWhatsapp size={15} color="white" />
              </a>
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
                <span className="w-12 h-7 rounded shrink-0 flex items-center justify-center gap-0.5 overflow-hidden" style={{ background: "linear-gradient(135deg, #EE3124, #c41f13)" }}>
                  <span className="text-white font-black text-[9px] leading-none">Jazz</span>
                  <span className="bg-[#F7941D] text-white font-bold text-[7px] px-0.5 py-0.5 rounded-sm leading-none">Cash</span>
                </span>
                JazzCash
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span className="w-12 h-7 rounded shrink-0 flex flex-col items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #1DBF73, #159956)" }}>
                  <span className="text-white font-black text-[7px] leading-none tracking-wide">easy</span>
                  <span className="text-white font-black text-[7px] leading-none tracking-wide">paisa</span>
                </span>
                EasyPaisa
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span className="w-10 h-6 bg-white/20 rounded text-white text-[9px] font-bold flex items-center justify-center shrink-0">COD</span>
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
