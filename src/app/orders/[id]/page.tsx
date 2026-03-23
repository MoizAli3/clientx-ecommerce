import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/supabase/queries";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { FadeIn } from "@/components/ui/motion";
import { formatPKR } from "@/lib/utils";
import { ShoppingBag, CheckCircle, MapPin, Phone, CreditCard } from "lucide-react";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { id } = await params;
  const { payment } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const order = await getOrderById(id);
  if (!order) notFound();

  const addr = order.shipping_address as {
    full_name: string; phone: string; address_line1: string;
    address_line2?: string; city: string; province: string; postal_code: string;
  };

  const paymentLabels: Record<string, string> = {
    jazzcash: "JazzCash",
    easypaisa: "EasyPaisa",
    cod: "Cash on Delivery",
  };

  const isNewOrder = payment === "cod" || payment === "success";

  return (
    <>
      <Navbar />
      <main className="max-w-[760px] mx-auto px-5 py-10">
        <FadeIn>

          {/* ── Receipt View (shown right after order placed) ── */}
          {isNewOrder && (
            <div className="mb-8">
              {/* Success header */}
              <div className="bg-white border border-[#d2d2d7] rounded-3xl p-8 text-center mb-4 shadow-sm">
                <div className="w-16 h-16 bg-[#34c759]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={36} className="text-[#34c759]" />
                </div>
                <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">
                  {payment === "cod" ? "Order Confirmed!" : "Payment Successful!"}
                </h1>
                <p className="text-[#6e6e73] text-sm mb-3">
                  {payment === "cod"
                    ? "Aapka order receive ho gaya. Delivery pe cash payment karein."
                    : "Aapka payment process ho gaya. Order confirm hai."}
                </p>
                <div className="inline-flex items-center gap-2 bg-[#f5f5f7] rounded-full px-4 py-2">
                  <span className="text-xs text-[#6e6e73]">Order Number</span>
                  <span className="text-sm font-bold text-[#1d1d1f] tracking-wide">{order.order_number}</span>
                </div>
              </div>

              {/* Receipt card */}
              <div className="bg-white border border-[#d2d2d7] rounded-3xl overflow-hidden shadow-sm">

                {/* Receipt header */}
                <div className="px-6 py-4 border-b border-[#f5f5f7] flex items-center justify-between">
                  <p className="font-semibold text-[#1d1d1f]">Order Receipt</p>
                  <p className="text-xs text-[#6e6e73]">
                    {new Date(order.created_at).toLocaleDateString("en-PK", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#f5f5f7]">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="relative w-14 h-14 bg-[#f5f5f7] rounded-xl overflow-hidden shrink-0">
                        {item.product?.images?.[0] ? (
                          <Image src={item.product.images[0]} alt="" fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={18} className="text-[#c7c7cc]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1d1d1f] line-clamp-1">{item.product?.name ?? "Product"}</p>
                        <p className="text-xs text-[#6e6e73]">Qty: {item.quantity} × {formatPKR(item.unit_price)}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#1d1d1f]">{formatPKR(item.total_price)}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="px-6 py-4 bg-[#f9f9f9] space-y-2 border-t border-[#f5f5f7]">
                  <div className="flex justify-between text-sm text-[#6e6e73]">
                    <span>Subtotal</span>
                    <span>{formatPKR(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#6e6e73]">
                    <span>Shipping</span>
                    <span className={order.shipping_fee === 0 ? "text-[#34c759]" : ""}>
                      {order.shipping_fee === 0 ? "Free" : formatPKR(order.shipping_fee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-[17px] text-[#1d1d1f] pt-2 border-t border-[#e5e5ea]">
                    <span>Total</span>
                    <span>{formatPKR(order.total)}</span>
                  </div>
                  {payment === "cod" && (
                    <p className="text-xs text-[#ff9500] font-medium pt-1">
                      Cash on Delivery — delivery pe {formatPKR(order.total)} ka intezam rakhein
                    </p>
                  )}
                </div>

                {/* Delivery + Payment info */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#f5f5f7] border-t border-[#f5f5f7]">
                  <div className="px-6 py-4">
                    <p className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <MapPin size={11} /> Delivery Address
                    </p>
                    <p className="text-sm font-medium text-[#1d1d1f]">{addr.full_name}</p>
                    <p className="text-sm text-[#6e6e73] flex items-center gap-1.5 mt-0.5">
                      <Phone size={11} /> {addr.phone}
                    </p>
                    <p className="text-sm text-[#6e6e73] mt-0.5">{addr.address_line1}</p>
                    {addr.address_line2 && <p className="text-sm text-[#6e6e73]">{addr.address_line2}</p>}
                    <p className="text-sm text-[#6e6e73]">{addr.city}, {addr.province}</p>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CreditCard size={11} /> Payment
                    </p>
                    <p className="text-sm font-medium text-[#1d1d1f]">{paymentLabels[order.payment_method] ?? order.payment_method}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#34c759] text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                      {order.status === "confirmed" ? "Confirmed" : order.status}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-[#f5f5f7] flex items-center gap-3">
                  <Link
                    href="/products"
                    className="flex-1 text-center py-2.5 bg-[#1d1d1f] text-white text-sm font-semibold rounded-full hover:bg-[#3a3a3c] transition-colors"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    href="/orders"
                    className="flex-1 text-center py-2.5 bg-[#f5f5f7] text-[#1d1d1f] text-sm font-semibold rounded-full hover:bg-[#e8e8ed] transition-colors"
                  >
                    My Orders
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Failed payment banner ── */}
          {payment === "failed" && (
            <div className="bg-[#ff3b30]/10 border border-[#ff3b30]/30 rounded-2xl p-5 mb-8 text-center">
              <p className="text-2xl mb-2">❌</p>
              <p className="font-semibold text-[17px] text-[#1d1d1f]">Payment fail ho gayi</p>
              <p className="text-sm text-[#6e6e73] mt-1">Dobara try karein ya COD select karein</p>
            </div>
          )}

          {/* ── Regular order detail (shown always, below receipt or standalone) ── */}
          {!isNewOrder && (
            <>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <Link href="/orders" className="text-sm text-[#0071e3] hover:underline mb-2 block">
                    ← Saray orders
                  </Link>
                  <h1 className="text-2xl font-semibold text-[#1d1d1f]">{order.order_number}</h1>
                  <p className="text-sm text-[#6e6e73] mt-1">
                    {new Date(order.created_at).toLocaleDateString("en-PK", {
                      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Items */}
              <div className="border border-[#d2d2d7] rounded-2xl overflow-hidden mb-6">
                <div className="px-5 py-3 border-b border-[#d2d2d7] bg-[#f5f5f7]">
                  <p className="text-sm font-semibold text-[#1d1d1f]">Items</p>
                </div>
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4 border-b border-[#d2d2d7] last:border-0">
                    <div className="relative w-16 h-16 bg-[#f5f5f7] rounded-xl overflow-hidden shrink-0">
                      {item.product?.images?.[0] ? (
                        <Image src={item.product.images[0]} alt="" fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={20} className="text-[#c7c7cc]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-[#1d1d1f] line-clamp-1">
                        {item.product?.name ?? "Product"}
                      </p>
                      <p className="text-sm text-[#6e6e73]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[15px] font-semibold text-[#1d1d1f]">
                      {formatPKR(item.total_price)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border border-[#d2d2d7] rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#d2d2d7] bg-[#f5f5f7]">
                    <p className="text-sm font-semibold text-[#1d1d1f]">Delivery Address</p>
                  </div>
                  <div className="px-5 py-4 text-sm text-[#6e6e73] space-y-1">
                    <p className="font-medium text-[#1d1d1f]">{addr.full_name}</p>
                    <p>{addr.phone}</p>
                    <p>{addr.address_line1}</p>
                    {addr.address_line2 && <p>{addr.address_line2}</p>}
                    <p>{addr.city}, {addr.province} {addr.postal_code}</p>
                  </div>
                </div>

                <div className="border border-[#d2d2d7] rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#d2d2d7] bg-[#f5f5f7]">
                    <p className="text-sm font-semibold text-[#1d1d1f]">Payment</p>
                  </div>
                  <div className="px-5 py-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#6e6e73]">Method</span>
                      <span className="font-medium">{paymentLabels[order.payment_method] ?? order.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6e6e73]">Subtotal</span>
                      <span>{formatPKR(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6e6e73]">Shipping</span>
                      <span>{order.shipping_fee === 0 ? "Free" : formatPKR(order.shipping_fee)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-[15px] border-t border-[#d2d2d7] pt-2">
                      <span>Total</span>
                      <span>{formatPKR(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </FadeIn>
      </main>
      <Footer />
    </>
  );
}
