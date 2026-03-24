"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatPKR } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  images: string[];
  stock: number;
}

interface OrderResult {
  order_id: string;
  order_number: string;
  total_pkr: number;
  payment_method: string;
  payment_form_url?: string;
  payment_payload?: Record<string, string>;
}

interface Message {
  role: "user" | "assistant";
  text: string;
  products?: Product[];
  orderResult?: OrderResult;
}

const QUICK_ACTIONS = [
  "Place an order",
  "Show me luxury watches",
  "Watches under PKR 15,000?",
  "Track my order",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! I'm MaxBot 👋 I can help you find the perfect watch, place an order, or track your delivery. What can I do for you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addItem = useCart((s) => s.addItem);
  const clearCart = useCart((s) => s.clearCart);
  const cartItems = useCart((s) => s.items);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const handleAddToCart = (product: Product, quantity = 1) => {
    addItem(product as Parameters<typeof addItem>[0], quantity);
    setCartAdded((prev) => [...prev, product.id]);
  };

  const submitPaymentForm = (formUrl: string, payload: Record<string, string>) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = formUrl;
    Object.entries(payload).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = String(v);
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      // Send cart items so AI knows what's in cart
      const apiCartItems = cartItems.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        price: i.product.sale_price ?? i.product.price,
      }));

      const apiMessages = updated.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, cartItems: apiCartItems }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.error }]);
        return;
      }

      // Auto-add to cart if AI triggered add_to_cart
      if (data.cartActions?.length) {
        for (const action of data.cartActions) {
          handleAddToCart(action.product as Product, action.quantity);
        }
      }

      // Handle order placed
      if (data.orderResult) {
        const order = data.orderResult as OrderResult;
        // Clear cart after successful order
        clearCart();

        // Redirect to payment for online methods
        if (order.payment_form_url && order.payment_payload) {
          setTimeout(() => submitPaymentForm(order.payment_form_url!, order.payment_payload!), 2000);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.message,
          products: data.products?.length ? data.products : undefined,
          orderResult: data.orderResult ?? undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1d1d1f] text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#3a3a3c]"
        aria-label="Open chat"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ff3b30] text-white text-[10px] font-bold flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-3xl shadow-2xl border border-[#e5e5e7] flex flex-col overflow-hidden"
          style={{ maxHeight: "min(620px, calc(100vh - 120px))" }}
        >
          {/* Header */}
          <div className="bg-[#1d1d1f] px-5 py-4 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#c9a84c] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-[15px] leading-none">MaxBot</p>
              <p className="text-white/50 text-xs mt-0.5">AI Assistant · Can place orders</p>
            </div>
            {cartItems.length > 0 && (
              <span className="text-[11px] font-semibold text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-1 rounded-full">
                {cartItems.length} in cart
              </span>
            )}
            <div className="w-2 h-2 rounded-full bg-[#34c759] ml-1" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#1d1d1f] flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[#c9a84c]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                  </div>
                )}
                <div className={`max-w-[80%] flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#1d1d1f] text-white rounded-tr-sm"
                      : "bg-[#f5f5f7] text-[#1d1d1f] rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>

                  {/* Order confirmation card */}
                  {msg.orderResult && (
                    <div className="bg-[#f0fdf4] border border-[#34c759]/30 rounded-2xl p-3.5 w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-[#34c759] flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <p className="text-[13px] font-bold text-[#1d1d1f]">Order Confirmed!</p>
                      </div>
                      <p className="text-[12px] text-[#6e6e73] mb-0.5">Order Number</p>
                      <p className="text-[15px] font-bold text-[#1d1d1f] font-mono mb-2">{msg.orderResult.order_number}</p>
                      <p className="text-[12px] text-[#6e6e73]">Total: <span className="font-semibold text-[#1d1d1f]">{formatPKR(msg.orderResult.total_pkr)}</span></p>
                      {msg.orderResult.payment_method === "cod" && (
                        <p className="text-[11px] text-[#34c759] font-medium mt-1.5">Pay on delivery — no upfront payment needed</p>
                      )}
                      {msg.orderResult.payment_form_url && (
                        <p className="text-[11px] text-[#c9a84c] font-medium mt-1.5">Redirecting to payment...</p>
                      )}
                      <Link href={`/orders/${msg.orderResult.order_id}`}
                        className="mt-2.5 block text-center text-[12px] font-semibold text-white bg-[#1d1d1f] rounded-full py-1.5 hover:bg-[#3a3a3c] transition-colors">
                        View Order Details
                      </Link>
                    </div>
                  )}

                  {/* Product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="flex flex-col gap-2 w-full">
                      {msg.products.slice(0, 4).map((p) => (
                        <div key={p.id} className="bg-white border border-[#e5e5e7] rounded-2xl p-3 flex gap-3 shadow-sm">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f5f5f7] shrink-0">
                            {p.images?.[0] && (
                              <Image src={p.images[0]} alt={p.name} width={64} height={64} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#1d1d1f] leading-snug line-clamp-2">{p.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[13px] font-bold text-[#1d1d1f]">{formatPKR(p.sale_price ?? p.price)}</span>
                              {p.sale_price && (
                                <span className="text-[11px] text-[#aeaeb2] line-through">{formatPKR(p.price)}</span>
                              )}
                            </div>
                            <div className="flex gap-1.5 mt-2">
                              <button
                                onClick={() => handleAddToCart(p)}
                                disabled={cartAdded.includes(p.id)}
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                                  cartAdded.includes(p.id)
                                    ? "bg-[#34c759]/10 text-[#34c759]"
                                    : "bg-[#1d1d1f] text-white hover:bg-[#3a3a3c]"
                                }`}
                              >
                                {cartAdded.includes(p.id) ? "✓ Added" : "Add to Cart"}
                              </button>
                              <Link
                                href={`/products/${p.slug}`}
                                className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#1d1d1f] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#c9a84c]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                </div>
                <div className="bg-[#f5f5f7] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#aeaeb2] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions (only initially) */}
          {messages.length === 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="text-[12px] px-3 py-1.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed] transition-colors font-medium"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-[#f0f0f0] shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex items-center gap-2 bg-[#f5f5f7] rounded-2xl px-4 py-2.5"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={cartItems.length > 0 ? "Say 'place my order' to checkout..." : "Ask anything..."}
                className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder:text-[#aeaeb2] outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center disabled:opacity-30 transition-opacity hover:bg-[#3a3a3c] shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
