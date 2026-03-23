import CryptoJS from "crypto-js";
import { generateTxnRef } from "@/lib/utils";
import type { EasyPaisaPayload, PaymentResponse } from "@/types";

const SANDBOX_URL =
  process.env.EASYPAISA_SANDBOX_URL ||
  "https://easypaisa.com.pk/paypig/";

const PRODUCTION_URL = "https://payments.easypaisa.com.pk/paypig/";

export function getEasyPaisaUrl() {
  return process.env.NODE_ENV === "production" ? PRODUCTION_URL : SANDBOX_URL;
}

/** Generate SHA256 hash for EasyPaisa */
function generateStoreHash(
  storeId: string,
  amount: string,
  orderRef: string,
  expiryDate: string,
  postBackURL: string,
  hashKey: string
): string {
  const raw = `${amount}&${expiryDate}&${orderRef}&${postBackURL}&${storeId}`;
  return CryptoJS.HmacSHA256(raw, hashKey).toString().toUpperCase();
}

export interface EasyPaisaInitPayload {
  orderId: string;
  amountPKR: number;
  returnUrl: string;
}

export function buildEasyPaisaPayload(input: EasyPaisaInitPayload): EasyPaisaPayload {
  const storeId = process.env.EASYPAISA_STORE_ID!;
  const hashKey = process.env.EASYPAISA_HASH_KEY!;

  const orderRef = generateTxnRef("EP");
  const amount = input.amountPKR.toFixed(2);

  // Expiry: 1 hour from now (YYYY-MM-DD HH:mm:ss)
  const expiry = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .substring(0, 19);

  const storeIdHash = generateStoreHash(
    storeId,
    amount,
    orderRef,
    expiry,
    input.returnUrl,
    hashKey
  );

  return {
    storeId,
    amount,
    postBackURL: input.returnUrl,
    orderRefNum: orderRef,
    expiryDate: expiry,
    autoRedirect: 1,
    storeIdHash,
  };
}

/** Verify EasyPaisa callback */
export function verifyEasyPaisaResponse(
  responseParams: Record<string, string>
): PaymentResponse {
  const hashKey = process.env.EASYPAISA_HASH_KEY!;
  const { storeId, amount, orderRefNum, expiryDate, postBackURL, storeIdHash } =
    responseParams;

  const expected = generateStoreHash(
    storeId,
    amount,
    orderRefNum,
    expiryDate,
    postBackURL,
    hashKey
  );

  if (storeIdHash !== expected) {
    return { success: false, transactionId: "", error: "Hash mismatch" };
  }

  const status = responseParams.paymentStatus || responseParams.status;
  if (status !== "PAID" && status !== "SUCCESS") {
    return {
      success: false,
      transactionId: orderRefNum || "",
      error: `EasyPaisa payment status: ${status}`,
    };
  }

  return { success: true, transactionId: orderRefNum };
}
