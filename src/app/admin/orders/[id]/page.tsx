import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/supabase/queries";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { AdminOrderStatusUpdate } from "@/components/admin/AdminOrderStatusUpdate";
import { formatPKR } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, MapPin, Phone, User, CreditCard } from "lucide-react";
import type { OrderStatus } from "@/types";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const user = order.user as unknown as {
    full_name: string;
    email: string;
    phone: string;
  } | null;
  const addr = order.shipping_address;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/orders"
          className="p-1.5 text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white rounded-xl transition-colors border border-transparent hover:border-[#d2d2d7]"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">{order.order_number}</h1>
          <p className="text-sm text-[#6e6e73]">
            {new Date(order.created_at).toLocaleString("en-PK", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="space-y-4">
        {/* Status Update */}
        <div className="bg-white rounded-2xl border border-[#d2d2d7] p-5">
          <h2 className="font-semibold text-[15px] text-[#1d1d1f] mb-3">Update Status</h2>
          <AdminOrderStatusUpdate orderId={order.id} current={order.status as OrderStatus} />
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-[#d2d2d7] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f5f5f7]">
            <h2 className="font-semibold text-[15px] text-[#1d1d1f]">
              Order Items ({order.items?.length ?? 0})
            </h2>
          </div>
          <div className="divide-y divide-[#f5f5f7]">
            {order.items?.map((item) => {
              const product = item.product as unknown as {
                name: string;
                images: string[];
              } | null;
              return (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                  {product?.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt=""
                      className="w-12 h-12 object-cover rounded-xl border border-[#d2d2d7] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1d1d1f] truncate">
                      {product?.name ?? "—"}
                    </p>
                    <p className="text-xs text-[#6e6e73]">
                      {item.quantity} × {formatPKR(item.unit_price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#1d1d1f] flex-shrink-0">
                    {formatPKR(item.total_price)}
                  </p>
                </div>
              );
            })}
          </div>
          {/* Totals */}
          <div className="px-5 py-4 border-t border-[#f5f5f7] space-y-2">
            <div className="flex justify-between text-sm text-[#6e6e73]">
              <span>Subtotal</span>
              <span>{formatPKR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#6e6e73]">
              <span>Shipping</span>
              <span>{order.shipping_fee === 0 ? "Free" : formatPKR(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-[#1d1d1f] pt-2 border-t border-[#f5f5f7]">
              <span>Total</span>
              <span>{formatPKR(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Customer + Shipping Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-[#d2d2d7] p-5">
            <h2 className="font-semibold text-[15px] text-[#1d1d1f] mb-3 flex items-center gap-2">
              <User size={14} /> Customer
            </h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-[#1d1d1f]">{user?.full_name ?? "—"}</p>
              <p className="text-[#6e6e73]">{user?.email ?? "—"}</p>
              <p className="text-[#6e6e73] flex items-center gap-1.5">
                <Phone size={11} />
                {user?.phone ?? "—"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#d2d2d7] p-5">
            <h2 className="font-semibold text-[15px] text-[#1d1d1f] mb-3 flex items-center gap-2">
              <MapPin size={14} /> Shipping Address
            </h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-[#1d1d1f]">{addr.full_name}</p>
              <p className="text-[#6e6e73] flex items-center gap-1.5">
                <Phone size={11} />
                {addr.phone}
              </p>
              <p className="text-[#6e6e73]">{addr.address_line1}</p>
              {addr.address_line2 && (
                <p className="text-[#6e6e73]">{addr.address_line2}</p>
              )}
              <p className="text-[#6e6e73]">
                {addr.city}, {addr.province}
                {addr.postal_code ? ` ${addr.postal_code}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-[#d2d2d7] p-5">
          <h2 className="font-semibold text-[15px] text-[#1d1d1f] mb-3 flex items-center gap-2">
            <CreditCard size={14} /> Payment
          </h2>
          <div className="flex items-center gap-8 text-sm">
            <div>
              <p className="text-xs text-[#6e6e73] mb-0.5">Method</p>
              <p className="font-medium text-[#1d1d1f] capitalize">{order.payment_method}</p>
            </div>
            {order.payment_reference && (
              <div>
                <p className="text-xs text-[#6e6e73] mb-0.5">Reference</p>
                <p className="font-mono text-[#1d1d1f]">{order.payment_reference}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-[#6e6e73] mb-0.5">Amount</p>
              <p className="font-semibold text-[#1d1d1f]">{formatPKR(order.total)}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-2xl border border-[#d2d2d7] p-5">
            <h2 className="font-semibold text-[15px] text-[#1d1d1f] mb-2">Notes</h2>
            <p className="text-sm text-[#6e6e73]">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
