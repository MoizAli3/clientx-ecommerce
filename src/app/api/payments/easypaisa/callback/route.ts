import { NextRequest, NextResponse } from "next/server";
import { handleEasyPaisaCallbackAction } from "@/actions/payments";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });

  const result = await handleEasyPaisaCallbackAction(params);

  const redirectUrl = result.success
    ? `${process.env.NEXT_PUBLIC_APP_URL}/orders?payment=success`
    : `${process.env.NEXT_PUBLIC_APP_URL}/orders?payment=failed`;

  return NextResponse.redirect(redirectUrl, { status: 303 });
}

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const result = await handleEasyPaisaCallbackAction(params);

  const redirectUrl = result.success
    ? `${process.env.NEXT_PUBLIC_APP_URL}/orders?payment=success`
    : `${process.env.NEXT_PUBLIC_APP_URL}/orders?payment=failed`;

  return NextResponse.redirect(redirectUrl);
}
