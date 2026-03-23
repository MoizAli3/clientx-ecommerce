"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPKR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/ui/motion";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const subtotal = total();
  const shipping = subtotal >= 5000 ? 0 : 250;
  const grandTotal = subtotal + shipping;

  return (
    <>
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-5 py-10 min-h-[60vh]">
        <FadeIn>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f] mb-8">
            Shopping Bag
          </h1>
        </FadeIn>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <ShoppingBag size={64} className="text-[#c7c7cc] mx-auto mb-4" />
            <p className="text-xl font-medium text-[#1d1d1f] mb-2">Your bag is empty</p>
            <p className="text-[#6e6e73] mb-8">Browse our collection and add something you love</p>
            <Link href="/products">
              <Button>Shop Now</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-1">
              <AnimatePresence>
                {items.map((item) => {
                  const price = item.product.sale_price ?? item.product.price;
                  return (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-4 py-5 border-b border-[#d2d2d7] last:border-0"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 md:w-24 md:h-24 bg-[#f5f5f7] rounded-2xl overflow-hidden shrink-0">
                        {item.product.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={24} className="text-[#c7c7cc]" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-[15px] font-medium text-[#1d1d1f] hover:text-[#0071e3] transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.category && (
                          <p className="text-xs text-[#6e6e73] mt-0.5">{item.product.category.name}</p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          {/* Qty controls */}
                          <div className="flex items-center gap-2 bg-[#f5f5f7] rounded-full px-1 py-1">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full hover:bg-white transition-colors flex items-center justify-center text-base font-medium"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full hover:bg-white transition-colors flex items-center justify-center text-base font-medium"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[15px] font-semibold text-[#1d1d1f]">
                              {formatPKR(price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="p-1.5 text-[#6e6e73] hover:text-[#ff3b30] transition-colors rounded-full hover:bg-[#f5f5f7]"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#f5f5f7] rounded-3xl p-6 sticky top-20"
              >
                <h2 className="text-xl font-semibold text-[#1d1d1f] mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-[15px]">
                    <span className="text-[#6e6e73]">Subtotal</span>
                    <span className="font-medium">{formatPKR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[15px]">
                    <span className="text-[#6e6e73]">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-[#34c759]">Free</span>
                      ) : (
                        formatPKR(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-[#6e6e73]">
                      Add {formatPKR(5000 - subtotal)} more for free delivery
                    </p>
                  )}
                </div>

                <div className="border-t border-[#d2d2d7] pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[17px]">Total</span>
                    <span className="font-semibold text-[17px]">{formatPKR(grandTotal)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block">
                  <Button size="lg" className="w-full">
                    Checkout <ArrowRight size={16} />
                  </Button>
                </Link>

                <Link href="/products" className="block mt-3">
                  <Button size="md" variant="ghost" className="w-full text-[#0071e3]">
                    Continue Shopping
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
