"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { formatPKR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createOrderAction } from "@/actions/orders";
import { initiateJazzCashAction, initiateEasyPaisaAction } from "@/actions/payments";
import { createBrowserClient } from "@supabase/ssr";

const PROVINCES = ["Punjab", "Sindh", "KPK", "Balochistan", "Gilgit-Baltistan", "AJK", "Islamabad"];
type PayMethod = "jazzcash" | "easypaisa" | "cod";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const subtotal = total();
  const shipping = subtotal >= 3000 ? 0 : 200;
  const grandTotal = subtotal + shipping;

  const [step, setStep] = useState<"address" | "payment">("address");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);
  const [payMethod, setPayMethod] = useState<PayMethod>("jazzcash");
  const [address, setAddress] = useState({
    full_name: "", phone: "", address_line1: "", address_line2: "",
    city: "", province: "Punjab", postal_code: "",
  });

  if (items.length === 0 && !orderPlaced) {
    router.replace("/cart");
    return null;
  }

  // Scroll error into view
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => {
      document.getElementById("checkout-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleAddressNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await createOrderAction({
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        payment_method: payMethod,
        shipping_address: address,
      });

      if (!result.success) {
        showError(result.error ?? "Order place nahi ho saka");
        return;
      }

      const { orderId } = result.data;
      setOrderPlaced(true);
      clearCart();

      if (payMethod === "jazzcash") {
        const pay = await initiateJazzCashAction(orderId);
        if (pay.success) {
          // Build and submit form to JazzCash
          const form = document.createElement("form");
          form.method = "POST";
          form.action = pay.data.formUrl;
          Object.entries(pay.data.payload).forEach(([k, v]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = k;
            input.value = String(v);
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
        }
      } else if (payMethod === "easypaisa") {
        const pay = await initiateEasyPaisaAction(orderId);
        if (pay.success) {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = pay.data.formUrl;
          Object.entries(pay.data.payload).forEach(([k, v]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = k;
            input.value = String(v);
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
        }
      } else {
        router.push(`/orders/${orderId}?payment=cod`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showError(msg || "Kuch masla hua. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-5 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-6">Checkout</h1>

        {isLoggedIn === false && (
          <div className="mb-6 bg-[#ff9500]/10 border border-[#ff9500]/30 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-xl">🔒</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1d1d1f]">Login zaroori hai order karne ke liye</p>
              <p className="text-xs text-[#6e6e73] mt-0.5">Account nahi? Register karo — bilkul free hai</p>
            </div>
            <Link href={`/auth/login?redirect=/checkout`}>
              <Button size="sm" className="shrink-0">Login</Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Steps */}
          <div className="lg:col-span-2">
            {/* Step tabs */}
            <div className="flex items-center gap-3 mb-8">
              {(["address", "payment"] as const).map((s, i) => (
                <button
                  key={s}
                  onClick={() => s === "payment" ? undefined : setStep(s)}
                  className="flex items-center gap-2"
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    step === s ? "bg-[#1d1d1f] text-white" : i === 0 ? "bg-[#34c759] text-white" : "bg-[#f5f5f7] text-[#6e6e73]"
                  }`}>
                    {i + 1}
                  </span>
                  <span className={`text-sm font-medium capitalize ${step === s ? "text-[#1d1d1f]" : "text-[#6e6e73]"}`}>
                    {s === "address" ? "Delivery Address" : "Payment"}
                  </span>
                  {i < 1 && <span className="text-[#d2d2d7] mx-1">—</span>}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === "address" ? (
                <motion.form
                  key="address"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  onSubmit={handleAddressNext}
                  className="space-y-4"
                >
                  {[
                    { name: "full_name", label: "Full Name", placeholder: "Ali Ahmed", required: true },
                    { name: "phone", label: "Phone Number", placeholder: "03001234567", required: true },
                    { name: "address_line1", label: "Address", placeholder: "House #, Street, Area", required: true },
                    { name: "address_line2", label: "Address Line 2 (optional)", placeholder: "Landmark, etc.", required: false },
                    { name: "city", label: "City", placeholder: "Lahore", required: true },
                    { name: "postal_code", label: "Postal Code (optional)", placeholder: "54000", required: false },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">{f.label}</label>
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        required={f.required}
                        value={(address as Record<string, string>)[f.name]}
                        onChange={(e) => setAddress((a) => ({ ...a, [f.name]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none transition-all text-[15px] placeholder:text-[#aeaeb2]"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Province</label>
                    <select
                      value={address.province}
                      onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none transition-all text-[15px] appearance-none"
                    >
                      {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>

                  <Button type="submit" size="lg" className="w-full mt-2">
                    Continue to Payment
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-4"
                >
                  {[
                    { id: "jazzcash" as PayMethod, label: "JazzCash", color: "#28a745", desc: "Mobile account ya debit card se pay karo" },
                    { id: "easypaisa" as PayMethod, label: "EasyPaisa", color: "#7b2d8b", desc: "EasyPaisa mobile account se pay karo" },
                    { id: "cod" as PayMethod, label: "Cash on Delivery", color: "#1d1d1f", desc: "Delivery pe naqdhi payment karo" },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setPayMethod(pm.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        payMethod === pm.id ? "border-[#1d1d1f] bg-[#f5f5f7]" : "border-[#d2d2d7] hover:border-[#aeaeb2]"
                      }`}
                    >
                      <span
                        className="w-10 h-10 rounded-xl text-white text-sm font-bold flex items-center justify-center shrink-0"
                        style={{ background: pm.color }}
                      >
                        {pm.id === "cod" ? "COD" : pm.label.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-[15px] font-semibold text-[#1d1d1f]">{pm.label}</p>
                        <p className="text-sm text-[#6e6e73]">{pm.desc}</p>
                      </div>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        payMethod === pm.id ? "border-[#1d1d1f]" : "border-[#d2d2d7]"
                      }`}>
                        {payMethod === pm.id && <div className="w-2.5 h-2.5 rounded-full bg-[#1d1d1f]" />}
                      </div>
                    </button>
                  ))}

                  {error && (
                    <div id="checkout-error" className="text-sm text-[#ff3b30] bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-xl px-4 py-3 flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setStep("address")} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handlePlaceOrder} loading={loading} className="flex-1">
                      Place Order
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Summary */}
          <div>
            <div className="bg-[#f5f5f7] rounded-3xl p-5 sticky top-20">
              <h2 className="font-semibold text-[17px] text-[#1d1d1f] mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-[#6e6e73] line-clamp-1 flex-1 mr-2">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium shrink-0">
                      {formatPKR((item.product.sale_price ?? item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#d2d2d7] pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6e6e73]">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-[#34c759]">Free</span> : formatPKR(shipping)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[17px]">
                  <span>Total</span>
                  <span>{formatPKR(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
