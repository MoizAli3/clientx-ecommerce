import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getUserOrders } from "@/lib/supabase/queries";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { FadeIn } from "@/components/ui/motion";
import { formatPKR } from "@/lib/utils";
import { ShoppingBag, Package, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/profile");

  const [profile, orders] = await Promise.all([
    getProfile(user.id),
    getUserOrders(user.id),
  ]);

  if (!profile) redirect("/auth/login");

  return (
    <>
      <Navbar />
      <main className="max-w-[900px] mx-auto px-5 py-10">
        <FadeIn>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-8">My Account</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Profile info */}
            <div className="md:col-span-1 space-y-4">
              {/* Avatar */}
              <div className="bg-white border border-[#d2d2d7] rounded-2xl p-5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-2xl font-semibold mb-3">
                  {profile.full_name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
                <p className="font-semibold text-[#1d1d1f]">{profile.full_name}</p>
                <p className="text-sm text-[#6e6e73] mt-0.5">{profile.email}</p>
                <div className="mt-3 text-xs font-medium px-3 py-1 rounded-full bg-[#f5f5f7] text-[#6e6e73]">
                  {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                </div>
              </div>

              {/* Profile form */}
              <ProfileForm profile={profile} />

              {/* Quick links */}
              <div className="bg-white border border-[#d2d2d7] rounded-2xl overflow-hidden">
                <Link
                  href="/orders"
                  className="flex items-center gap-3 px-5 py-4 hover:bg-[#f5f5f7] transition-colors border-b border-[#f5f5f7]"
                >
                  <Package size={16} className="text-[#6e6e73]" />
                  <span className="text-sm font-medium text-[#1d1d1f]">All Orders</span>
                  <span className="ml-auto text-[#aeaeb2]">→</span>
                </Link>
                <Link
                  href="/products"
                  className="flex items-center gap-3 px-5 py-4 hover:bg-[#f5f5f7] transition-colors border-b border-[#f5f5f7]"
                >
                  <ShoppingBag size={16} className="text-[#6e6e73]" />
                  <span className="text-sm font-medium text-[#1d1d1f]">Shop Now</span>
                  <span className="ml-auto text-[#aeaeb2]">→</span>
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#ff3b30]/5 transition-colors text-left">
                    <LogOut size={16} className="text-[#ff3b30]" />
                    <span className="text-sm font-medium text-[#ff3b30]">Sign Out</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Orders */}
            <div className="md:col-span-2">
              <div className="bg-white border border-[#d2d2d7] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#d2d2d7] bg-[#f5f5f7]">
                  <p className="text-sm font-semibold text-[#1d1d1f]">Recent Orders</p>
                </div>

                {orders.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="font-medium text-[#1d1d1f] mb-1">No orders yet</p>
                    <p className="text-sm text-[#6e6e73] mb-5">Order your first watch today!</p>
                    <Link
                      href="/products"
                      className="inline-block px-5 py-2 bg-[#0071e3] text-white text-sm font-semibold rounded-full hover:bg-[#0077ed] transition-colors"
                    >
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#f5f5f7]">
                    {orders.map((order) => {
                      const firstImage = order.items?.[0]?.product?.images?.[0];
                      const addr = order.shipping_address as { city?: string };
                      return (
                        <Link
                          key={order.id}
                          href={`/orders/${order.id}`}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-[#f9f9f9] transition-colors group"
                        >
                          {/* Product thumb */}
                          <div className="relative w-14 h-14 bg-[#f5f5f7] rounded-xl overflow-hidden shrink-0">
                            {firstImage ? (
                              <Image src={firstImage} alt="" fill className="object-cover" sizes="56px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag size={16} className="text-[#c7c7cc]" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-[#1d1d1f]">{order.order_number}</p>
                              <OrderStatusBadge status={order.status} />
                            </div>
                            <p className="text-xs text-[#6e6e73]">
                              {new Date(order.created_at).toLocaleDateString("en-PK", {
                                year: "numeric", month: "short", day: "numeric",
                              })}
                              {addr?.city ? ` · ${addr.city}` : ""}
                              {" · "}
                              {order.items?.length ?? 0} {(order.items?.length ?? 0) === 1 ? "item" : "items"}
                            </p>
                          </div>

                          {/* Total + arrow */}
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-[#1d1d1f]">{formatPKR(order.total)}</p>
                            <p className="text-xs text-[#0071e3] group-hover:underline mt-0.5">View →</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeIn>
      </main>
      <Footer />
    </>
  );
}
