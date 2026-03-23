"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPKR } from "@/lib/utils";
import { fadeUp } from "@/components/ui/motion";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const displayPrice = product.sale_price ?? product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  return (
    <motion.div
      variants={fadeUp}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square bg-[#f5f5f7] rounded-2xl overflow-hidden mb-3">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={40} className="text-[#c7c7cc]" />
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-[#ff3b30] text-white text-xs font-semibold px-2 py-1 rounded-full">
              -{discountPct}%
            </span>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-medium text-[#6e6e73]">Out of Stock</span>
            </div>
          )}

          {/* Quick add button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute bottom-3 right-3 w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-[#1d1d1f] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => {
              e.preventDefault();
              if (product.stock > 0) addItem(product);
            }}
            disabled={product.stock === 0}
            aria-label="Add to cart"
          >
            <ShoppingBag size={15} />
          </motion.button>
        </div>

        {/* Info */}
        <div className="px-1">
          {product.category && (
            <p className="text-xs text-[#6e6e73] mb-0.5">{product.category.name}</p>
          )}
          <h3 className="text-[15px] font-medium text-[#1d1d1f] line-clamp-2 leading-snug mb-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-[#1d1d1f]">
              {formatPKR(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-[#6e6e73] line-through">
                {formatPKR(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
