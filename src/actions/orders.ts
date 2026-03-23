"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { CreateOrderSchema, UpdateOrderStatusSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type { ApiResponse, Order } from "@/types";

// ─── Create Order ──────────────────────────────────────────────────────────────

export async function createOrderAction(
  payload: unknown
): Promise<ApiResponse<{ orderId: string; orderNumber: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: { orderId: "", orderNumber: "" }, error: "Please sign in to place an order." };
  }

  const parsed = CreateOrderSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      data: { orderId: "", orderNumber: "" },
      error: parsed.error.issues[0].message,
    };
  }

  const { items, payment_method, shipping_address, notes } = parsed.data;

  // Fetch products to verify prices (never trust client-side prices)
  const productIds = items.map((i) => i.product_id);
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, price, sale_price, stock, is_active")
    .in("id", productIds);

  if (prodError || !products?.length) {
    return { success: false, data: { orderId: "", orderNumber: "" }, error: "Could not load product details." };
  }

  // Validate stock + build line items
  const productMap = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product || !product.is_active) {
      return {
        success: false,
        data: { orderId: "", orderNumber: "" },
        error: "One or more products are no longer available.",
      };
    }
    if (product.stock < item.quantity) {
      return {
        success: false,
        data: { orderId: "", orderNumber: "" },
        error: `Insufficient stock (${item.quantity} requested, ${product.stock} available)`,
      };
    }
    const unitPrice = product.sale_price ?? product.price;
    subtotal += unitPrice * item.quantity;
  }

  const shippingFee = subtotal >= 5000 ? 0 : 250; // Free shipping above PKR 5000
  const total = subtotal + shippingFee;
  const orderNumber = generateOrderNumber();

  // COD orders are immediately confirmed; online payments start as pending
  const initialStatus = payment_method === "cod" ? "confirmed" : "pending";

  // Insert order + items in a transaction using admin client
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
    .select()
    .single();

  if (orderError || !order) {
    return { success: false, data: { orderId: "", orderNumber: "" }, error: "Could not create order. Please try again." };
  }

  // Insert order items
  const orderItems = items.map((item) => {
    const product = productMap.get(item.product_id)!;
    const unitPrice = product.sale_price ?? product.price;
    return {
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: unitPrice * item.quantity,
    };
  });

  const { error: itemsError } = await adminSupabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    // Rollback order
    await adminSupabase.from("orders").delete().eq("id", order.id);
    return { success: false, data: { orderId: "", orderNumber: "" }, error: "Could not save order items. Please try again." };
  }

  // Decrement stock
  for (const item of items) {
    const product = productMap.get(item.product_id)!;
    await adminSupabase
      .from("products")
      .update({ stock: product.stock - item.quantity })
      .eq("id", item.product_id);
  }

  // Send confirmation email (non-blocking)
  try {
    const fullOrder = {
      ...order,
      items: orderItems.map((oi, i) => ({
        ...oi,
        id: `temp-${i}`,
        product: products.find((p) => p.id === oi.product_id),
      })),
      shipping_address,
    } as unknown as Order;

    await sendOrderConfirmationEmail(fullOrder, user.email ?? "");
  } catch {
    // Email failure should not fail the order
  }

  return { success: true, data: { orderId: order.id, orderNumber: order.order_number } };
}

// ─── Get Order ─────────────────────────────────────────────────────────────────

export async function getOrderAction(orderId: string): Promise<ApiResponse<Order | null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "Please sign in to continue." };
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*))")
    .eq("id", orderId)
    .single();

  if (error || !data) {
    return { success: false, data: null, error: "Order not found." };
  }

  // RLS handles auth, but double-check ownership for non-admins
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && data.user_id !== user.id) {
    return { success: false, data: null, error: "Unauthorized" };
  }

  return { success: true, data: data as Order };
}

// ─── Update Order Status (Admin) ───────────────────────────────────────────────

export async function updateOrderStatusAction(
  payload: unknown
): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, data: null, error: "Login karein pehle" };

  // Admin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, data: null, error: "Sirf admin yeh kar sakta hai" };
  }

  const parsed = UpdateOrderStatusSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, data: null, error: parsed.error.issues[0].message };
  }

  const { order_id, status } = parsed.data;
  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("orders")
    .update({ status })
    .eq("id", order_id);

  if (error) {
    return { success: false, data: null, error: "Could not update order status." };
  }

  return { success: true, data: null };
}
