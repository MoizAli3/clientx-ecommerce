"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/components/ui/motion";
import type { Category } from "@/types";

const CATEGORY_META: Record<string, { tag: string; image: string; desc: string }> = {
  "luxury-watches": {
    tag: "Luxury",
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=85",
    desc: "Swiss movement · Gold & platinum",
  },
  "sports-watches": {
    tag: "Sports",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=85",
    desc: "Water-resistant · Chronograph",
  },
  "casual-watches": {
    tag: "Casual",
    image: "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=600&q=85",
    desc: "Minimal design · Daily wear",
  },
  "smart-watches": {
    tag: "Smart",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=85",
    desc: "Health tracking · Notifications",
  },
  "ladies-watches": {
    tag: "Ladies",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=85",
    desc: "Elegant · Diamond & rose gold",
  },
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className="max-w-[1200px] mx-auto px-5 py-16">
      <div className="mb-10">
        <p className="text-sm font-medium text-[#c9a84c] mb-1 uppercase tracking-wider">Collections</p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
          Shop by Category
        </h2>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat.slug];
          return (
            <motion.div key={cat.id} variants={fadeUp}>
              <Link
                href={`/products?category=${cat.slug}`}
                className="group block rounded-2xl overflow-hidden relative aspect-[3/4] bg-[#f5f5f7]"
              >
                {meta?.image && (
                  <Image
                    src={meta.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent" />

                {/* Category tag top-left */}
                {meta?.tag && (
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#c9a84c] bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#c9a84c]/30">
                      {meta.tag}
                    </span>
                  </div>
                )}

                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-[15px] leading-tight">
                    {cat.name}
                  </p>
                  {meta?.desc && (
                    <p className="text-white/55 text-[11px] mt-1 leading-snug">{meta.desc}</p>
                  )}
                </div>

                {/* Hover gold border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#c9a84c] rounded-2xl transition-colors duration-300" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
