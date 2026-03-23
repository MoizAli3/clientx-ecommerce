import { NextRequest, NextResponse } from "next/server";
import { handleJazzCashCallbackAction } from "@/actions/payments";

// JazzCash sends a POST form-redirect to this URL
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });

  const result = await handleJazzCashCallbackAction(params);
  const orderId = params.pp_BillReference;

  const redirectUrl = result.success
    ? `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?payment=success`
    : `${process.env.NEXT_PUBLIC_APP_URL}/checkout?payment=failed&order=${orderId}`;

  return NextResponse.redirect(redirectUrl, { status: 303 });
}

// Some integrations send GET
export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const result = await handleJazzCashCallbackAction(params);
  const orderId = params.pp_BillReference;

  const redirectUrl = result.success
    ? `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?payment=success`
    : `${process.env.NEXT_PUBLIC_APP_URL}/checkout?payment=failed&order=${orderId}`;

  return NextResponse.redirect(redirectUrl);
}
