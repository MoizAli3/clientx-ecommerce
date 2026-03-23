"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";

const navLinks = [
  { label: "All Watches", href: "/products" },
  { label: "Luxury", href: "/products?category=luxury-watches" },
  { label: "Sports", href: "/products?category=sports-watches" },
  { label: "Smart", href: "/products?category=smart-watches" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const itemCount = useCart((s) => s.itemCount());
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    startTransition(() => {
      setMobileOpen(false);
      setSearchOpen(false);
    });
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        suppressHydrationWarning
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-[#d2d2d7]/60 shadow-sm"
            : "bg-white/70 backdrop-blur-md"
        )}
      >
        <div className="max-w-[1200px] mx-auto px-5 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="font-semibold text-[17px] tracking-tight text-[#1d1d1f] shrink-0">
            MaxWatch
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-[14px] transition-colors duration-150 whitespace-nowrap group",
                  pathname === link.href
                    ? "text-[#1d1d1f] font-medium"
                    : "text-[#6e6e73] hover:text-[#1d1d1f]"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute -bottom-0.5 left-0 h-[1.5px] bg-[#1d1d1f] transition-all duration-200",
                  pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Search bar inline */}
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSearch}
                  className="overflow-hidden"
                >
                  <input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search watches..."
                    className="w-full px-3 py-1.5 text-sm bg-[#f5f5f7] rounded-full border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none transition-all"
                  />
                </motion.form>
              )}
            </AnimatePresence>

            <button
              onClick={() => {
                if (searchOpen && searchQuery.trim()) {
                  router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchOpen(false);
                  setSearchQuery("");
                } else {
                  setSearchOpen(!searchOpen);
                }
              }}
              className="p-2.5 text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-colors"
              aria-label="Search"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            <Link
              href="/profile"
              className="p-2.5 text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-colors hidden md:flex"
            >
              <User size={18} />
            </Link>

            <Link href="/cart" className="relative p-2.5 text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-colors">
              <ShoppingBag size={18} />
              <AnimatePresence>
                {mounted && itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#c9a84c] text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-colors"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#d2d2d7] md:hidden"
          >
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="px-5 pt-4 pb-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aeaeb2]" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search watches..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#f5f5f7] rounded-full border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none"
                />
              </div>
            </form>
            <nav className="px-5 py-2 flex flex-col gap-0.5 pb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-3 text-[16px] text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/orders" className="px-3 py-3 text-[16px] text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-xl transition-colors">
                My Orders
              </Link>
              <Link href="/profile" className="px-3 py-3 text-[16px] text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-xl transition-colors">
                Account
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="w-full text-left px-3 py-3 text-[16px] text-[#ff3b30] hover:bg-[#ff3b30]/5 rounded-xl transition-colors">
                  Sign Out
                </button>
              </form>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-14" />
    </>
  );
}
