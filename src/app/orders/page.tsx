import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserOrders } from "@/lib/supabase/queries";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { FadeUp, StaggerList } from "@/components/ui/motion";
import { formatPKR } from "@/lib/utils";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/orders");

  const orders = await getUserOrders(user.id);

  return (
    <>
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-5 py-10 min-h-[60vh]">
        <FadeUp>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-8">My Orders</h1>
        </FadeUp>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-xl font-medium text-[#1d1d1f] mb-2">Koi order nahi</p>
            <p className="text-[#6e6e73] mb-8">Abhi tak koi order nahi kiya</p>
            <Link href="/products" className="text-[#0071e3] hover:underline text-[15px]">
              Shop Now →
            </Link>
          </div>
        ) : (
          <StaggerList className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="block group">
                <div className="border border-[#d2d2d7] rounded-2xl p-5 hover:border-[#aeaeb2] hover:shadow-sm transition-all duration-200 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#6e6e73] mb-1">
                        {new Date(order.created_at).toLocaleDateString("en-PK", {
                          year: "numeric", month: "long", day: "numeric"
                        })}
                      </p>
                      <p className="font-semibold text-[15px] text-[#1d1d1f]">{order.order_number}</p>
                      <p className="text-sm text-[#6e6e73] mt-0.5">
                        {(order.items as unknown[])?.length ?? 0} items · {formatPKR(order.total)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-xs text-[#0071e3] group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </StaggerList>
        )}
      </main>
      <Footer />
    </>
  );
}
