"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Star, Truck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 min-h-[88vh] items-center py-16">

          {/* ── Left: Content ── */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
              Premium Timepieces · Since 2020
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-5xl md:text-6xl lg:text-[64px] font-semibold tracking-tight text-[#1d1d1f] leading-[1.05] mb-5"
            >
              Wear Time.
              <br />
              <span className="text-[#c9a84c]">Define Style.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-lg text-[#6e6e73] mb-8 leading-relaxed max-w-md"
            >
              Pakistan&apos;s finest collection of luxury, sports, and smart watches.
              Every timepiece is 100% authentic with 1-year warranty.
            </motion.p>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              {[
                { icon: Shield, label: "100% Authentic" },
                { icon: Star, label: "4.9★ Rated" },
                { icon: Truck, label: "Free Delivery" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-sm text-[#6e6e73]">
                  <Icon size={14} className="text-[#c9a84c]" />
                  {label}
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex items-center gap-3 flex-wrap"
            >
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white rounded-full gap-2"
                >
                  Shop Now <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/products?category=luxury-watches">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full"
                >
                  Luxury Collection
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center gap-8 mt-12 pt-10 border-t border-[#f5f5f7]"
            >
              {[
                { value: "500+", label: "Watches" },
                { value: "10K+", label: "Happy Customers" },
                { value: "50+", label: "Brands" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-[#1d1d1f]">{s.value}</p>
                  <p className="text-xs text-[#6e6e73] mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Watch Image ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="order-1 lg:order-2 flex items-center justify-center"
          >
            <div className="relative w-full max-w-[520px] aspect-square">
              {/* Glow rings */}
              <motion.div
                className="absolute inset-8 rounded-full border border-[#c9a84c]/20"
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-16 rounded-full border border-[#c9a84c]/30"
                animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />

              {/* Subtle background circle */}
              <div className="absolute inset-4 rounded-full bg-[#f5f5f7]" />

              {/* Watch image */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="relative w-[85%] h-[85%] drop-shadow-2xl">
                  <Image
                    src="/watch.png"
                    alt="MaxWatch Premium Timepiece"
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 90vw, 520px"
                  />
                </div>
              </div>

              {/* Floating badge — top right */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute top-8 right-0 bg-white rounded-2xl shadow-lg px-4 py-3 border border-[#f5f5f7]"
              >
                <p className="text-xs text-[#6e6e73]">Starting from</p>
                <p className="text-lg font-bold text-[#1d1d1f]">PKR 6,500</p>
              </motion.div>

              {/* Floating badge — bottom left */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="absolute bottom-10 -left-2 bg-[#1d1d1f] rounded-2xl shadow-lg px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} className="w-3 h-3 text-[#c9a84c]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-white font-medium">4.9 · 2,400 reviews</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
