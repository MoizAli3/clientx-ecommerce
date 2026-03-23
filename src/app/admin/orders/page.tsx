import Link from "next/link";
import { getAllOrders } from "@/lib/supabase/queries";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { AdminOrderStatusUpdate } from "@/components/admin/AdminOrderStatusUpdate";
import { FadeUp } from "@/components/ui/motion";
import { formatPKR } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const { orders, count } = await getAllOrders({
    status: params.status,
    limit: 20,
    offset: (page - 1) * 20,
  });

  return (
    <div className="w-full">
      <FadeUp>
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Orders ({count})</h1>
      </FadeUp>

      <div className="bg-white rounded-2xl border border-[#d2d2d7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f5f5f7]">
                {["Order", "Customer", "Total", "Payment", "Status", "Date", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6e6e73] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#6e6e73]">
                    No orders found
                  </td>
                </tr>
              )}
              {orders.map((order) => {
                const user = (order as unknown as { user?: { full_name: string; phone: string } }).user;
                return (
                  <tr key={order.id} className="hover:bg-[#f9f9f9] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-[#0071e3] hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#1d1d1f]">{user?.full_name ?? "—"}</p>
                      <p className="text-xs text-[#6e6e73]">{user?.phone ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPKR(order.total)}</td>
                    <td className="px-4 py-3 text-[#6e6e73] capitalize">{order.payment_method}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </td>
                    <td className="px-4 py-3 text-[#6e6e73] text-xs">
                      {new Date(order.created_at).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-4 py-3">
                      <AdminOrderStatusUpdate orderId={order.id} current={order.status as OrderStatus} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
