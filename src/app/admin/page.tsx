import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FadeUp, StaggerList } from "@/components/ui/motion";
import { formatPKR } from "@/lib/utils";
import { ShoppingCart, Package, Users, TrendingUp } from "lucide-react";
import { AdminCharts } from "@/components/admin/AdminCharts";
import type { RevenuePoint, StatusPoint } from "@/components/admin/AdminCharts";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [ordersResult, productsResult, usersResult, revenueResult] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("orders").select("total").eq("status", "delivered"),
  ]);

  const revenue = revenueResult.data?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;

  const stats = [
    { label: "Total Orders", value: ordersResult.count ?? 0, icon: ShoppingCart, color: "#0071e3" },
    { label: "Active Products", value: productsResult.count ?? 0, icon: Package, color: "#34c759" },
    { label: "Customers", value: usersResult.count ?? 0, icon: Users, color: "#ff9500" },
    { label: "Revenue", value: formatPKR(revenue), icon: TrendingUp, color: "#ff3b30" },
  ];

  // ─── Chart Data ─────────────────────────────────────────────────────────────

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [chartOrdersResult, allOrdersStatusResult] = await Promise.all([
    supabase
      .from("orders")
      .select("created_at, total, status")
      .gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("orders").select("status"),
  ]);

  // Build revenue by day (last 7 days)
  const revenueByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-PK", { month: "short", day: "numeric" });
    revenueByDay[key] = 0;
  }
  chartOrdersResult.data?.forEach((o) => {
    if (["cancelled", "payment_failed", "refunded"].includes(o.status)) return;
    const key = new Date(o.created_at).toLocaleDateString("en-PK", {
      month: "short",
      day: "numeric",
    });
    if (key in revenueByDay) revenueByDay[key] += Number(o.total);
  });
  const revenueData: RevenuePoint[] = Object.entries(revenueByDay).map(([date, rev]) => ({
    date,
    revenue: rev,
  }));

  // Build orders by status count
  const statusMap: Record<string, number> = {};
  allOrdersStatusResult.data?.forEach((o) => {
    statusMap[o.status] = (statusMap[o.status] ?? 0) + 1;
  });
  const statusData: StatusPoint[] = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
  }));

  // ─── Recent Orders ───────────────────────────────────────────────────────────

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, order_number, total, status, created_at, user:profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(8);

  const statusColors: Record<string, string> = {
    pending: "#f59e0b", confirmed: "#16a34a", delivered: "#34c759",
    payment_failed: "#ff3b30", cancelled: "#ff3b30", shipped: "#6366f1",
    processing: "#0071e3", payment_pending: "#f59e0b", refunded: "#6e6e73",
  };

  return (
    <div className="w-full">
      <FadeUp>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">Dashboard</h1>
          <p className="text-sm text-[#6e6e73] mt-0.5">MaxWatches ka overview</p>
        </div>
      </FadeUp>

      {/* Stats */}
      <StaggerList className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#d2d2d7]">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${stat.color}15` }}
              >
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{stat.value}</p>
              <p className="text-sm text-[#6e6e73] mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </StaggerList>

      {/* Charts */}
      <FadeUp>
        <AdminCharts revenueData={revenueData} statusData={statusData} />
      </FadeUp>

      {/* Recent Orders */}
      <FadeUp>
        <div className="bg-white rounded-2xl border border-[#d2d2d7] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#d2d2d7] flex items-center justify-between">
            <h2 className="font-semibold text-[15px] text-[#1d1d1f]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[#0071e3] hover:underline">See all →</Link>
          </div>
          <div className="divide-y divide-[#f5f5f7]">
            {recentOrders?.map((order) => {
              const user = order.user as unknown as { full_name: string } | null;
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f5f5f7] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1d1d1f]">{order.order_number}</p>
                    <p className="text-xs text-[#6e6e73]">{user?.full_name ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatPKR(order.total)}</span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        color: statusColors[order.status] ?? "#6e6e73",
                        background: `${statusColors[order.status] ?? "#6e6e73"}15`,
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
