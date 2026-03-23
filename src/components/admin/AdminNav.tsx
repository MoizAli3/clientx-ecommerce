"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-[#d2d2d7] hidden md:flex flex-col z-40">
      <div className="px-5 py-5 border-b border-[#d2d2d7]">
        <Link href="/" className="font-semibold text-[17px] text-[#1d1d1f]">MaxWatches</Link>
        <p className="text-xs text-[#6e6e73] mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              pathname === href
                ? "bg-[#1d1d1f] text-white"
                : "text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-[#d2d2d7]">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#ff3b30] transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
