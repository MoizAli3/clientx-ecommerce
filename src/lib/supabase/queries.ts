import { createClient } from "./server";
import type { Product, Category, Order, User } from "@/types";

// ─── Categories ────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return data as Category[];
}

// ─── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(opts?: {
  categorySlug?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ products: Product[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, category:categories(*)", { count: "exact" })
    .eq("is_active", true);

  if (opts?.categorySlug) {
    // Resolve slug → id first; PostgREST can't filter on aliased join columns
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", opts.categorySlug)
      .single();
    if (cat) {
      query = query.eq("category_id", cat.id);
    } else {
      return { products: [], count: 0 };
    }
  }
  if (opts?.search) {
    query = query.ilike("name", `%${opts.search}%`);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(opts?.offset ?? 0, (opts?.offset ?? 0) + (opts?.limit ?? 20) - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { products: data as Product[], count: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as Product;
}

// ─── Orders ────────────────────────────────────────────────────────────────────

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Order[];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*)), user:profiles(*)")
    .eq("id", orderId)
    .single();

  if (error) return null;
  return data as Order;
}

// ─── Admin ─────────────────────────────────────────────────────────────────────

export async function getAllOrders(opts?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ orders: Order[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, user:profiles(full_name, phone), items:order_items(id)", { count: "exact" });

  if (opts?.status) {
    query = query.eq("status", opts.status);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(opts?.offset ?? 0, (opts?.offset ?? 0) + (opts?.limit ?? 20) - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { orders: data as Order[], count: count ?? 0 };
}

export async function getProfile(userId: string): Promise<User | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data as User | null;
}
