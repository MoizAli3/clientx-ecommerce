import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are MaxBot, the friendly AI assistant for MaxWatch — Pakistan's #1 premium watch store.

You help customers:
- Browse and find the perfect watch (luxury, sports, smart watches)
- Get product details, prices in PKR, and availability
- Add products to their cart
- Track orders
- Answer questions about shipping, payments, and returns

Store info:
- Free shipping on orders above PKR 5,000 (PKR 250 below that)
- Payment: JazzCash, EasyPaisa, Cash on Delivery
- Delivery: 3-5 business days across Pakistan
- 1-year warranty on all watches
- Returns within 7 days if unused

Be friendly, helpful, and concise. Respond in the same language the customer uses (Urdu or English).
When showing products, always mention the price in PKR. If a customer wants to buy something, use add_to_cart tool.
For order tracking, ask for their order number (format: MW-XXXXX).`;

const tools: Anthropic.Tool[] = [
  {
    name: "search_products",
    description: "Search for watches in the store by name, category, or price range",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search term (brand, style, etc.)" },
        category_slug: { type: "string", description: "Filter by category slug" },
        max_price: { type: "number", description: "Max price in PKR" },
        limit: { type: "number", description: "Max results (default 4, max 6)" },
      },
      required: [],
    },
  },
  {
    name: "get_categories",
    description: "Get all watch categories available in the store",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_order_status",
    description: "Look up an order status by order number",
    input_schema: {
      type: "object" as const,
      properties: {
        order_number: { type: "string", description: "Order number e.g. MW-12345" },
      },
      required: ["order_number"],
    },
  },
  {
    name: "add_to_cart",
    description: "Add a product to the customer's cart. Use when customer wants to buy or add a specific product.",
    input_schema: {
      type: "object" as const,
      properties: {
        product_id: { type: "string", description: "Product ID" },
        product_name: { type: "string", description: "Product name" },
        quantity: { type: "number", description: "Quantity (default 1)" },
      },
      required: ["product_id", "product_name"],
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
      .limit(Math.min(limit, 6));

    if (query) q = q.ilike("name", `%${query}%`);
    if (max_price) q = q.lte("price", max_price);
    if (category_slug) {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", category_slug).single();
      if (cat) q = q.eq("category_id", cat.id);
    }

    const { data, error } = await q;
    if (error) return { error: error.message };
    return { products: data ?? [] };
  }

  if (name === "get_categories") {
    const { data, error } = await supabase.from("categories").select("name, slug").eq("is_active", true).order("sort_order");
    if (error) return { error: error.message };
    return { categories: data ?? [] };
  }

  if (name === "get_order_status") {
    const { order_number } = input as { order_number: string };
    const { data, error } = await supabase
      .from("orders")
      .select("order_number, status, total, created_at, shipping_address")
      .eq("order_number", order_number.toUpperCase())
      .single();
    if (error || !data) return { error: "Order not found. Please check your order number." };
    return {
      order_number: data.order_number,
      status: data.status,
      total: data.total,
      placed_at: data.created_at,
    };
  }

  if (name === "add_to_cart") {
    // Verify product exists and is in stock
    const { product_id, quantity = 1 } = input as { product_id: string; product_name: string; quantity?: number };
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, sale_price, images, stock")
      .eq("id", product_id)
      .eq("is_active", true)
      .single();
    if (error || !data) return { error: "Product not found." };
    if (data.stock < quantity) return { error: `Only ${data.stock} left in stock.` };
    return { action: "add_to_cart", product: data, quantity };
  }

  return { error: "Unknown tool" };
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as {
      messages: Anthropic.MessageParam[];
    };

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const cartActions: { product: unknown; quantity: number }[] = [];
    const shownProducts: unknown[] = [];

    // Agentic loop — handle tool calls until Claude returns text
    let currentMessages = [...messages];
    let finalText = "";

    for (let i = 0; i < 5; i++) {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools,
        messages: currentMessages,
      });

      if (response.stop_reason === "end_turn") {
        finalText = response.content
          .filter((b) => b.type === "text")
          .map((b) => (b as Anthropic.TextBlock).text)
          .join("");
        break;
      }

      if (response.stop_reason === "tool_use") {
        const assistantMsg: Anthropic.MessageParam = { role: "assistant", content: response.content };
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of response.content) {
          if (block.type !== "tool_use") continue;
          const result = await executeTool(block.name, block.input as Record<string, unknown>);

          // Collect products to show in UI
          if ("products" in result && Array.isArray(result.products)) {
            shownProducts.push(...result.products);
          }
          // Collect cart actions
          if ("action" in result && result.action === "add_to_cart") {
            cartActions.push({ product: result.product, quantity: result.quantity as number });
          }

          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }

        currentMessages = [...currentMessages, assistantMsg, { role: "user", content: toolResults }];
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
