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
import { ShoppingBag } from "lucide-react";

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

  return (
    <>
      <Navbar />
      <main className="max-w-[800px] mx-auto px-5 py-10">
        <FadeIn>
          {/* Success banner */}
          {(payment === "success" || payment === "cod") && (
            <div className="bg-[#34c759]/10 border border-[#34c759]/30 rounded-2xl p-5 mb-8 text-center">
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-semibold text-[17px] text-[#1d1d1f]">
                {payment === "cod" ? "Order place ho gaya!" : "Payment successful!"}
              </p>
              <p className="text-sm text-[#6e6e73] mt-1">
                Hum aapko email karenge jab order ship ho ga.
              </p>
            </div>
          )}

          {payment === "failed" && (
            <div className="bg-[#ff3b30]/10 border border-[#ff3b30]/30 rounded-2xl p-5 mb-8 text-center">
              <p className="text-2xl mb-2">❌</p>
              <p className="font-semibold text-[17px] text-[#1d1d1f]">Payment fail ho gayi</p>
              <p className="text-sm text-[#6e6e73] mt-1">Dobara try karein ya COD select karein</p>
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <Link href="/orders" className="text-sm text-[#0071e3] hover:underline mb-2 block">
                ← Saray orders
              </Link>
              <h1 className="text-2xl font-semibold text-[#1d1d1f]">{order.order_number}</h1>
              <p className="text-sm text-[#6e6e73] mt-1">
                {new Date(order.created_at).toLocaleDateString("en-PK", {
                  year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
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
            {/* Shipping */}
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

            {/* Payment summary */}
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
        </FadeIn>
      </main>
      <Footer />
    </>
  );
}
