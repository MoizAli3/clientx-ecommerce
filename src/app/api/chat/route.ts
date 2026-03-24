import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { ChatCompletionMessageParam, ChatCompletionToolMessageParam } from "groq-sdk/resources/chat/completions";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are MaxBot, the friendly AI assistant for MaxWatch — Pakistan's #1 premium watch store.

You help customers:
- Browse and find the perfect watch (luxury, sports, smart watches)
- Get product details, prices in PKR, and availability
- Add products to their cart
- Track orders by order number
- Answer questions about shipping, payments, and returns

Store info:
- Free shipping on orders above PKR 5,000 (PKR 250 below that)
- Payment: JazzCash, EasyPaisa, Cash on Delivery
- Delivery: 3-5 business days across Pakistan
- 1-year warranty on all watches
- Returns within 7 days if unused

Rules:
- Be friendly, helpful, and concise
- Respond in the same language the customer uses (Urdu or English)
- Always show prices in PKR
- When a customer wants to buy, use the add_to_cart tool
- For order tracking, ask for their order number (format: MW-XXXXX)
- Never make up products — always use search_products tool`;

type GroqTool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
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
          category_slug: { type: "string", description: "Filter by category slug" },
          max_price: { type: "number", description: "Max price in PKR" },
          limit: { type: "number", description: "Max results to return (default 4, max 6)" },
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
      description: "Add a product to the customer's cart. Use when customer wants to buy a specific product.",
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
];

async function executeTool(name: string, input: Record<string, unknown>) {
  const supabase = await createClient();

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

  if (name === "get_categories") {
    const { data, error } = await supabase
      .from("categories")
      .select("name, slug")
      .eq("is_active", true)
      .order("sort_order");
    if (error) return { error: error.message };
    return { categories: data ?? [] };
  }

  if (name === "get_order_status") {
    const { order_number } = input as { order_number: string };
    const { data, error } = await supabase
      .from("orders")
      .select("order_number, status, total, created_at")
      .eq("order_number", order_number.toUpperCase().trim())
      .single();
    if (error || !data) return { error: "Order not found. Please double-check your order number." };
    return {
      order_number: data.order_number,
      status: data.status,
      total_pkr: data.total,
      placed_at: new Date(data.created_at).toLocaleDateString("en-PK"),
    };
  }

  if (name === "add_to_cart") {
    const { product_id, quantity = 1 } = input as { product_id: string; product_name: string; quantity?: number };
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, sale_price, images, stock")
      .eq("id", product_id)
      .eq("is_active", true)
      .single();
    if (error || !data) return { error: "Product not found." };
    if ((data as { stock: number }).stock < (Number(quantity) || 1)) {
      return { error: `Only ${(data as { stock: number }).stock} left in stock.` };
    }
    return { action: "add_to_cart", product: data, quantity: Number(quantity) || 1 };
  }

  return { error: "Unknown tool" };
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
    }

    const { messages } = await req.json() as { messages: ChatCompletionMessageParam[] };

    const cartActions: { product: unknown; quantity: number }[] = [];
    const shownProducts: unknown[] = [];

    let currentMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    let finalText = "";

    // Agentic loop — up to 5 iterations to handle tool calls
    for (let i = 0; i < 5; i++) {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
        temperature: 0.7,
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

      // Process tool calls
      currentMessages.push({ role: "assistant", content: msg.content ?? "", tool_calls: msg.tool_calls });

      for (const toolCall of msg.tool_calls) {
        let input: Record<string, unknown> = {};
        try { input = JSON.parse(toolCall.function.arguments); } catch { /* ignore */ }

        const result = await executeTool(toolCall.function.name, input);

        // Collect products to display in UI
        if ("products" in result && Array.isArray(result.products)) {
          shownProducts.push(...result.products);
        }
        // Collect cart actions
        if ("action" in result && result.action === "add_to_cart") {
          cartActions.push({ product: result.product, quantity: result.quantity as number });
        }

        currentMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }

    return NextResponse.json({
      message: finalText,
      products: shownProducts,
      cartActions,
    });
  } catch (err) {
    console.error("[chat]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
