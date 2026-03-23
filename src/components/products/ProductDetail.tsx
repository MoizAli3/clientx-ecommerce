"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Check, ChevronLeft, ChevronRight, Shield, Truck, RotateCcw, Star } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPKR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

export function ProductDetail({ product }: { product: Product }) {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const images = product.images?.length ? product.images : [];
  const displayPrice = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
      {/* ── Left: Image gallery ── */}
      <div>
        <div className="relative aspect-square bg-[#f5f5f7] rounded-3xl overflow-hidden mb-3 shadow-sm">
          <AnimatePresence mode="wait">
            {images[activeImg] ? (
              <motion.div
                key={activeImg}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[activeImg]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <ShoppingBag size={56} className="text-[#c7c7cc]" />
                <p className="text-sm text-[#aeaeb2]">No image</p>
              </div>
            )}
          </AnimatePresence>

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-[#ff3b30] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{discountPct}%
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  i === activeImg
                    ? "border-[#c9a84c] shadow-sm"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}

        {/* Trust row under image */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: Shield, label: "100% Authentic", sub: "Certified genuine" },
            { icon: Truck, label: "Free Delivery", sub: "Above PKR 5,000" },
            { icon: RotateCcw, label: "Easy Returns", sub: "7-day policy" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center bg-[#f5f5f7] rounded-2xl p-3 gap-1">
              <Icon size={16} className="text-[#c9a84c]" />
              <p className="text-[11px] font-semibold text-[#1d1d1f] leading-tight">{label}</p>
              <p className="text-[10px] text-[#6e6e73] leading-tight">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Info ── */}
      <div className="py-2">
        {/* Category breadcrumb */}
        {product.category && (
          <p className="text-xs font-semibold text-[#c9a84c] uppercase tracking-widest mb-3">
            {product.category.name}
          </p>
        )}

        <h1 className="text-3xl md:text-[36px] font-semibold tracking-tight text-[#1d1d1f] mb-3 leading-[1.1]">
          {product.name}
        </h1>

        {/* Rating row */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={13} className="text-[#c9a84c]" fill="#c9a84c" />
            ))}
          </div>
          <span className="text-sm text-[#6e6e73]">4.9 · 120+ reviews</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#f0f0f0]">
          <span className="text-4xl font-bold text-[#1d1d1f]">{formatPKR(displayPrice)}</span>
          {hasDiscount && (
            <>
              <span className="text-xl text-[#aeaeb2] line-through">{formatPKR(product.price)}</span>
              <span className="text-sm font-bold text-[#ff3b30] bg-[#ff3b30]/10 px-2.5 py-1 rounded-full">
                Save {discountPct}%
              </span>
            </>
          )}
        </div>

        {/* Description */}
        <p className="text-[#6e6e73] leading-relaxed mb-6 text-[15px]">{product.description}</p>

        {/* Watch specs */}
        <div className="bg-[#f5f5f7] rounded-2xl p-4 mb-6 grid grid-cols-2 gap-3">
          {[
            { label: "Movement", value: "Quartz / Automatic" },
            { label: "Water Resistance", value: "30m–100m" },
            { label: "Case Material", value: "Stainless Steel" },
            { label: "Warranty", value: "1 Year" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-semibold text-[#aeaeb2] uppercase tracking-wider">{label}</p>
              <p className="text-[13px] font-medium text-[#1d1d1f] mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Stock */}
        <div className="mb-5">
          {product.stock > 10 ? (
            <p className="text-sm text-[#34c759] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse" />
              In Stock — Ready to Ship
            </p>
          ) : product.stock > 0 ? (
            <p className="text-sm text-[#ff9500] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff9500]" />
              Only {product.stock} left in stock
            </p>
          ) : (
            <p className="text-sm text-[#ff3b30] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff3b30]" />
              Out of Stock
            </p>
          )}
        </div>

        {/* Quantity + Add to bag */}
        {product.stock > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 bg-[#f5f5f7] rounded-full px-1 py-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full hover:bg-white transition-colors flex items-center justify-center text-xl font-light text-[#1d1d1f]"
              >
                −
              </button>
              <span className="w-8 text-center text-[15px] font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="w-9 h-9 rounded-full hover:bg-white transition-colors flex items-center justify-center text-xl font-light text-[#1d1d1f]"
              >
                +
              </button>
            </div>

            <motion.div layout className="flex-1">
              <Button
                size="lg"
                className={`w-full rounded-full transition-all ${
                  added
                    ? "bg-[#34c759] hover:bg-[#34c759]"
                    : "bg-[#1d1d1f] hover:bg-[#3a3a3c]"
                }`}
                onClick={handleAdd}
                disabled={product.stock === 0}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      <Check size={16} /> Added to Bag
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag size={16} /> Add to Bag
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        )}

        {/* SKU + shipping note */}
        <div className="pt-5 border-t border-[#f0f0f0] space-y-1.5">
          <p className="text-xs text-[#aeaeb2]">SKU: <span className="text-[#6e6e73]">{product.sku}</span></p>
          <p className="text-xs text-[#aeaeb2]">
            Free delivery on orders above{" "}
            <span className="text-[#6e6e73] font-medium">PKR 5,000</span>. Cash on delivery available across Pakistan.
          </p>
        </div>
      </div>
    </div>
  );
}
