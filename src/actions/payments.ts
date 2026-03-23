"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildJazzCashPayload,
  getJazzCashUrl,
  verifyJazzCashResponse,
} from "@/lib/payments/jazzcash";
import {
  buildEasyPaisaPayload,
  getEasyPaisaUrl,
  verifyEasyPaisaResponse,
} from "@/lib/payments/easypaisa";
import {
  JazzCashCallbackSchema,
  EasyPaisaCallbackSchema,
} from "@/lib/validations";
import type { ApiResponse, PaymentResponse } from "@/types";

// ─── Initiate JazzCash ─────────────────────────────────────────────────────────

export async function initiateJazzCashAction(orderId: string): Promise<
  ApiResponse<{ formUrl: string; payload: Record<string, string> }>
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, data: { formUrl: "", payload: {} }, error: "Login karein" };

  const { data: order } = await supabase
    .from("orders")
    .select("id, total, shipping_address, order_number")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return { success: false, data: { formUrl: "", payload: {} }, error: "Order nahi mila" };
  }

  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/jazzcash/callback`;

  const payload = buildJazzCashPayload({
    orderId: order.id,
    amountPKR: order.total,
    phone: (order.shipping_address as { phone: string }).phone,
    description: `Order ${order.order_number}`,
    returnUrl,
  });

  // Log the request
  const adminSupabase = await createAdminClient();
  await adminSupabase.from("payment_logs").insert({
    order_id: orderId,
    gateway: "jazzcash",
    direction: "request",
    payload: payload as unknown as Record<string, unknown>,
  });

  // Update order status
  await adminSupabase
    .from("orders")
    .update({ status: "payment_pending" })
    .eq("id", orderId);

  return {
    success: true,
    data: {
      formUrl: getJazzCashUrl(),
      payload: payload as unknown as Record<string, string>,
    },
  };
}

// ─── Initiate EasyPaisa ────────────────────────────────────────────────────────

export async function initiateEasyPaisaAction(orderId: string): Promise<
  ApiResponse<{ formUrl: string; payload: Record<string, string | number> }>
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, data: { formUrl: "", payload: {} }, error: "Login karein" };

  const { data: order } = await supabase
    .from("orders")
    .select("id, total, order_number")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return { success: false, data: { formUrl: "", payload: {} }, error: "Order nahi mila" };
  }

  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/easypaisa/callback`;

  const payload = buildEasyPaisaPayload({
    orderId: order.id,
    amountPKR: order.total,
    returnUrl,
  });

  const adminSupabase = await createAdminClient();
  await adminSupabase.from("payment_logs").insert({
    order_id: orderId,
    gateway: "easypaisa",
    direction: "request",
    payload: payload as unknown as Record<string, unknown>,
  });

  await adminSupabase
    .from("orders")
    .update({ status: "payment_pending" })
    .eq("id", orderId);

  return {
    success: true,
    data: {
      formUrl: getEasyPaisaUrl(),
      payload: payload as unknown as Record<string, string | number>,
    },
  };
}

// ─── Handle JazzCash Callback (called from API route) ─────────────────────────

export async function handleJazzCashCallbackAction(
  rawParams: Record<string, string>
): Promise<PaymentResponse> {
  const parsed = JazzCashCallbackSchema.safeParse(rawParams);
  if (!parsed.success) {
    return { success: false, transactionId: "", error: "Invalid callback data" };
  }

  const adminSupabase = await createAdminClient();

  // Log the callback
  await adminSupabase.from("payment_logs").insert({
    order_id: parsed.data.pp_BillReference,
    gateway: "jazzcash",
    direction: "callback",
    payload: rawParams,
  });

  const result = verifyJazzCashResponse(rawParams);

  await adminSupabase
    .from("orders")
    .update({
      status: result.success ? "confirmed" : "payment_failed",
      payment_reference: result.transactionId || null,
    })
    .eq("id", parsed.data.pp_BillReference);

  return result;
}

// ─── Handle EasyPaisa Callback ─────────────────────────────────────────────────

export async function handleEasyPaisaCallbackAction(
  rawParams: Record<string, string>
): Promise<PaymentResponse> {
  const parsed = EasyPaisaCallbackSchema.safeParse(rawParams);
  if (!parsed.success) {
    return { success: false, transactionId: "", error: "Invalid callback data" };
  }

  const adminSupabase = await createAdminClient();

  // Use orderRefNum to find the order (stored as payment_reference during initiation)
  const { data: order } = await adminSupabase
    .from("orders")
    .select("id")
    .eq("payment_reference", parsed.data.orderRefNum)
    .maybeSingle();

  await adminSupabase.from("payment_logs").insert({
    order_id: order?.id ?? null,
    gateway: "easypaisa",
    direction: "callback",
    payload: rawParams,
  });

  const result = verifyEasyPaisaResponse(rawParams);

  if (order?.id) {
    await adminSupabase
      .from("orders")
      .update({
        status: result.success ? "confirmed" : "payment_failed",
      })
      .eq("id", order.id);
  }

  return result;
}
