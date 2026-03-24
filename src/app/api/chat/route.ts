import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { initiateJazzCashAction, initiateEasyPaisaAction } from "@/actions/payments";
import type { Order } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are MaxBot, the intelligent AI assistant for MaxWatch — Pakistan's #1 premium watch store.

You fully understand natural language. Whether the customer types in English, Urdu, Roman Urdu, or a mix — you understand and respond naturally.

Examples of what you understand:
- "mujhe ek watch chahiye" → they want to buy a watch
- "order place karna hai" → they want to place an order
- "mera order kahan hai" → they want to track their order
- "kitne ka hai" → asking for price
- "cart mein daal do" → add to cart
- "sasta kuch hai" → looking for affordable options
- "checkout karna hai" → want to complete purchase
- "delivery kitne din mein hogi" → asking about delivery time

CAPABILITIES:
1. Product discovery — search, filter by category/price, show recommendations
2. Cart management — add items to cart
3. Order placement — collect address + payment, place complete order
4. Order tracking — look up order status by order number
5. Customer support — shipping, returns, warranty, payment questions

STORE INFO:
- Free shipping above PKR 5,000 (PKR 250 below that)
- Payment: JazzCash, EasyPaisa, Cash on Delivery (COD)
- Delivery: 3-5 business days across Pakistan
- 1-year warranty on all watches
- Returns within 7 days (unused, original packaging)

GREETINGS & SMALL TALK:
- If the customer says "hi", "hello", "hey", "salam", "assalam o alaikum", "kya haal hai" or any greeting → ONLY greet back warmly, ask how you can help. Do NOT call any tool, do NOT start ordering flow.
- If the customer asks a general question → just answer it. No tools needed unless they ask about products/orders.

ORDERING FLOW — follow this EXACT multi-step sequence. Never skip steps:
STEP 1: Customer clearly asks to place order / checkout / buy something specific
STEP 2: Check cart. If empty → help find products first. Show what's in cart.
STEP 3: Ask for shipping address (full name, phone number, full address, city, province)
STEP 4: Ask for payment method (JazzCash / EasyPaisa / Cash on Delivery)
STEP 5: Show complete order summary and ask "Kya main order place kar doon?" / "Shall I place the order?"
STEP 6: Wait for EXPLICIT confirmation — "haan", "yes", "confirm", "theek hai", "kar do", "place it", "ok"
STEP 7: Only THEN call place_order tool
STEP 8: Share order number and next steps

CRITICAL RULES — NEVER BREAK THESE:
- NEVER call place_order unless you have received explicit confirmation in the LAST customer message
- NEVER call place_order just because customer is browsing or said "hey" or asked a question
- NEVER skip straight to place_order without going through all steps
- NEVER call any tool for greetings, small talk, or general questions
- Match the customer's language (Urdu/English/Roman Urdu)
- Never invent products — always call search_products
- Show prices in PKR always
- Be warm, helpful, patient`;

type GroqTool = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

const tools: GroqTool[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search for watches in the store by name, category, or price range",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search term (brand, style, watch type)" },
          category_slug: { type: "string", description: "Category slug to filter by" },
          max_price: { type: "number", description: "Max price in PKR" },
          limit: { type: "number", description: "Max results (default 4, max 6)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_categories",
      description: "Get all watch categories available in the store",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_order_status",
      description: "Look up an order status by order number",
      parameters: {
        type: "object",
        properties: {
          order_number: { type: "string", description: "Order number e.g. MW-12345" },
        },
        required: ["order_number"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_to_cart",
      description: "Add a product to the customer's cart",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "string", description: "Product ID" },
          product_name: { type: "string", description: "Product name" },
          quantity: { type: "number", description: "Quantity to add (default 1)" },
        },
        required: ["product_id", "product_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "place_order",
      description: "Place an order. Only call after collecting complete shipping address, payment method, and customer confirmation.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "Items to order (from cart)",
            items: {
              type: "object",
              properties: {
                product_id: { type: "string" },
                quantity: { type: "number" },
              },
              required: ["product_id", "quantity"],
            },
          },
          shipping_address: {
            type: "object",
            description: "Delivery address",
            properties: {
              full_name: { type: "string" },
              phone: { type: "string" },
              address_line1: { type: "string" },
              address_line2: { type: "string" },
              city: { type: "string" },
              province: { type: "string" },
              postal_code: { type: "string" },
            },
            required: ["full_name", "phone", "address_line1", "city", "province"],
          },
          payment_method: {
            type: "string",
            enum: ["cod", "jazzcash", "easypaisa"],
            description: "Payment method chosen by customer",
          },
          notes: { type: "string", description: "Any special instructions" },
        },
        required: ["items", "shipping_address", "payment_method"],
      },
    },
  },
];

type CartItem = { product_id: string; quantity: number };

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  cartItems: CartItem[],
  userConfirmed = false
) {
  const supabase = await createClient();

  // ── search_products ────────────────────────────────────────────────────────
  if (name === "search_products") {
    const { query, category_slug, max_price, limit = 4 } = input as {
      query?: string; category_slug?: string; max_price?: number; limit?: number;
    };
    let q = supabase
      .from("products")
      .select("id, name, slug, price, sale_price, images, stock, category:categories(name, slug)")
      .eq("is_active", true)
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(Math.min(Number(limit) || 4, 6));
    if (query) q = q.ilike("name", `%${query}%`);
    if (max_price) q = q.lte("price", max_price);
    if (category_slug) {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", category_slug).single();
      if (cat) q = q.eq("category_id", (cat as { id: string }).id);
    }
    const { data, error } = await q;
    if (error) return { error: error.message };
    return { products: data ?? [], count: data?.length ?? 0 };
  }

  // ── get_categories ─────────────────────────────────────────────────────────
  if (name === "get_categories") {
    const { data, error } = await supabase
      .from("categories").select("name, slug").eq("is_active", true).order("sort_order");
    if (error) return { error: error.message };
    return { categories: data ?? [] };
  }

  // ── get_order_status ───────────────────────────────────────────────────────
  if (name === "get_order_status") {
    const { order_number } = input as { order_number: string };
    const { data, error } = await supabase
      .from("orders")
      .select("order_number, status, total, created_at")
      .eq("order_number", order_number.toUpperCase().trim())
      .single();
    if (error || !data) return { error: "Order not found. Please check your order number." };
    return {
      order_number: data.order_number,
      status: data.status,
      total_pkr: data.total,
      placed_at: new Date(data.created_at).toLocaleDateString("en-PK"),
    };
  }

  // ── add_to_cart ────────────────────────────────────────────────────────────
  if (name === "add_to_cart") {
    const { product_id, quantity = 1 } = input as { product_id: string; product_name: string; quantity?: number };
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, sale_price, images, stock")
      .eq("id", product_id).eq("is_active", true).single();
    if (error || !data) return { error: "Product not found." };
    const stock = (data as { stock: number }).stock;
    if (stock < (Number(quantity) || 1)) return { error: `Only ${stock} left in stock.` };
    return { action: "add_to_cart", product: data, quantity: Number(quantity) || 1 };
  }

  // ── place_order ────────────────────────────────────────────────────────────
  if (name === "place_order") {
    // Hard guard: customer must have explicitly confirmed in their last message
    if (!userConfirmed) {
      return { error: "Please ask the customer to confirm the order first before placing it. Show them the order summary and ask for confirmation." };
    }
    const { items: inputItems, shipping_address, payment_method, notes } = input as {
      items: CartItem[];
      shipping_address: Record<string, string>;
      payment_method: "cod" | "jazzcash" | "easypaisa";
      notes?: string;
    };

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Customer must be logged in to place an order. Please sign in first." };

    // Use cart items if AI didn't specify them, fallback to input items
    const orderItems = (inputItems?.length ? inputItems : cartItems).map((i) => ({
      product_id: i.product_id,
      quantity: Number(i.quantity) || 1,
    }));

    if (!orderItems.length) return { error: "No items to order. Please add products to cart first." };

    // Verify products & prices from DB (never trust client)
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, name, price, sale_price, stock, is_active")
      .in("id", orderItems.map((i) => i.product_id));

    if (prodError || !products?.length) return { error: "Could not verify products. Please try again." };

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;

    for (const item of orderItems) {
      const p = productMap.get(item.product_id);
      if (!p || !p.is_active) return { error: "One or more products are unavailable." };
      if (p.stock < item.quantity) return { error: `Only ${p.stock} left in stock for "${p.name}".` };
      subtotal += (p.sale_price ?? p.price) * item.quantity;
    }

    const shippingFee = subtotal >= 5000 ? 0 : 250;
    const total = subtotal + shippingFee;
    const orderNumber = generateOrderNumber();
    const initialStatus = payment_method === "cod" ? "confirmed" : "pending";

    const adminSupabase = await createAdminClient();

    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: initialStatus,
        payment_method,
        subtotal,
        shipping_fee: shippingFee,
        total,
        shipping_address,
        notes: notes ?? null,
      })
      .select().single();

    if (orderError || !order) return { error: "Could not create order. Please try again." };

    // Insert order items
    const { error: itemsError } = await adminSupabase
      .from("order_items")
      .insert(orderItems.map((item) => {
        const p = productMap.get(item.product_id)!;
        const unitPrice = p.sale_price ?? p.price;
        return { order_id: order.id, product_id: item.product_id, quantity: item.quantity, unit_price: unitPrice, total_price: unitPrice * item.quantity };
      }));

    if (itemsError) {
      await adminSupabase.from("orders").delete().eq("id", order.id);
      return { error: "Could not save order items. Please try again." };
    }

    // Decrement stock
    for (const item of orderItems) {
      const p = productMap.get(item.product_id)!;
      await adminSupabase.from("products").update({ stock: p.stock - item.quantity }).eq("id", item.product_id);
    }

    // Send confirmation email (non-blocking)
    try {
      await sendOrderConfirmationEmail({ ...order, items: [], shipping_address } as unknown as Order, user.email ?? "");
    } catch { /* email failure should not fail the order */ }

    // For COD: done. For online payment: get redirect URL.
    if (payment_method === "cod") {
      return {
        action: "order_placed",
        order_id: order.id,
        order_number: orderNumber,
        total_pkr: total,
        shipping_fee: shippingFee,
        payment_method: "cod",
      };
    }

    // Online payment — get redirect
    const payResult = payment_method === "jazzcash"
      ? await initiateJazzCashAction(order.id)
      : await initiateEasyPaisaAction(order.id);

    if (!payResult.success) {
      return { action: "order_placed", order_id: order.id, order_number: orderNumber, total_pkr: total, payment_method, payment_error: payResult.error };
    }

    return {
      action: "order_placed",
      order_id: order.id,
      order_number: orderNumber,
      total_pkr: total,
      payment_method,
      payment_form_url: payResult.data.formUrl,
      payment_payload: payResult.data.payload,
    };
  }

  return { error: "Unknown tool" };
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
    }

    const { messages, cartItems = [] } = await req.json() as {
      messages: ChatCompletionMessageParam[];
      cartItems: CartItem[];
    };

    const cartActions: { product: unknown; quantity: number }[] = [];
    const shownProducts: unknown[] = [];
    let orderResult: Record<string, unknown> | null = null;

    // Extract last user message for confirmation guard
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const lastUserText = typeof lastUserMsg?.content === "string" ? lastUserMsg.content.toLowerCase() : "";

    // Hard guard — only allow place_order if the last message contains an explicit confirmation
    const CONFIRMATION_WORDS = ["haan", "yes", "confirm", "theek hai", "kar do", "place it", "ok", "okay", "bilkul", "zaroor", "done", "proceed", "go ahead", "do it", "place order"];
    const userConfirmed = CONFIRMATION_WORDS.some((w) => lastUserText.includes(w));

    // Inject cart context into system message
    const cartContext = cartItems.length
      ? `\n\nCurrent cart: ${JSON.stringify(cartItems.map((i) => ({ product_id: i.product_id, quantity: i.quantity })))}`
      : "\n\nCurrent cart: empty";

    let currentMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT + cartContext },
      ...messages,
    ];

    let finalText = "";

    for (let i = 0; i < 6; i++) {
      const response = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens: 1024,
        temperature: 0.6,
        messages: currentMessages,
        tools,
        tool_choice: "auto",
      });

      const choice = response.choices[0];
      const msg = choice.message;

      if (choice.finish_reason === "stop" || !msg.tool_calls?.length) {
        finalText = msg.content ?? "";
        break;
      }

      currentMessages.push({ role: "assistant", content: msg.content ?? "", tool_calls: msg.tool_calls });

      for (const toolCall of msg.tool_calls) {
        let input: Record<string, unknown> = {};
        try { input = JSON.parse(toolCall.function.arguments); } catch { /* ignore */ }

        const result = await executeTool(toolCall.function.name, input, cartItems, userConfirmed);

        if ("products" in result && Array.isArray(result.products)) {
          shownProducts.push(...result.products);
        }
        if ("action" in result && result.action === "add_to_cart") {
          cartActions.push({ product: result.product, quantity: result.quantity as number });
        }
        if ("action" in result && result.action === "order_placed") {
          orderResult = result as Record<string, unknown>;
        }

        currentMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }

    return NextResponse.json({ message: finalText, products: shownProducts, cartActions, orderResult });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[chat]", msg);
    // Surface rate limit errors to the user; hide other internal errors
    const isRateLimit = msg.includes("rate_limit") || msg.includes("429");
    return NextResponse.json(
      { error: isRateLimit ? "I'm a bit busy right now. Please try again in a few minutes." : "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
