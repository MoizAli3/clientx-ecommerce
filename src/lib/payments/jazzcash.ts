import CryptoJS from "crypto-js";
import { generateTxnRef, toPaisa, formatJazzCashDate, jazzCashExpiry } from "@/lib/utils";
import type { JazzCashPayload, PaymentResponse } from "@/types";

const SANDBOX_URL =
  process.env.JAZZCASH_SANDBOX_URL ||
  "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

const PRODUCTION_URL =
  "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

export function getJazzCashUrl() {
  return process.env.NODE_ENV === "production" ? PRODUCTION_URL : SANDBOX_URL;
}

/** Generate HMAC-SHA256 secure hash for JazzCash */
function generateSecureHash(params: Record<string, string>, salt: string): string {
  // Sort keys alphabetically, concatenate: salt + & + values
  const sorted = Object.keys(params)
    .filter((k) => k.startsWith("pp_") || k.startsWith("ppmpf_"))
    .sort()
    .map((k) => params[k])
    .join("&");

  const hashString = `${salt}&${sorted}`;
  return CryptoJS.HmacSHA256(hashString, salt).toString().toUpperCase();
}

export interface JazzCashInitPayload {
  orderId: string;
  amountPKR: number;
  phone: string;
  description: string;
  returnUrl: string;
}

export function buildJazzCashPayload(input: JazzCashInitPayload): JazzCashPayload {
  const merchantId = process.env.JAZZCASH_MERCHANT_ID!;
  const password = process.env.JAZZCASH_PASSWORD!;
  const salt = process.env.JAZZCASH_INTEGRITY_SALT!;

  const txnRef = generateTxnRef("JC");
  const now = new Date();

  const params: Record<string, string> = {
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_TxnRefNo: txnRef,
    pp_Amount: toPaisa(input.amountPKR),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: formatJazzCashDate(now),
    pp_BillReference: input.orderId,
    pp_Description: input.description,
    pp_TxnExpiryDateTime: jazzCashExpiry(30),
    pp_ReturnURL: input.returnUrl,
    pp_Language: "EN",
    ppmpf_1: input.phone,
    pp_SecureHash: "", // placeholder
  };

  params.pp_SecureHash = generateSecureHash(params, salt);

  return params as unknown as JazzCashPayload;
}

/** Verify JazzCash callback response */
export function verifyJazzCashResponse(
  responseParams: Record<string, string>
): PaymentResponse {
  const salt = process.env.JAZZCASH_INTEGRITY_SALT!;
  const receivedHash = responseParams.pp_SecureHash;

  const paramsWithoutHash = { ...responseParams };
  delete paramsWithoutHash.pp_SecureHash;

  const expectedHash = generateSecureHash(paramsWithoutHash, salt);

  if (receivedHash !== expectedHash) {
    return { success: false, transactionId: "", error: "Hash mismatch — response tampered" };
  }

  const responseCode = responseParams.pp_ResponseCode;
  if (responseCode !== "000") {
    return {
      success: false,
      transactionId: responseParams.pp_TxnRefNo || "",
      error: `JazzCash error: ${responseParams.pp_ResponseMessage || responseCode}`,
    };
  }

  return { success: true, transactionId: responseParams.pp_TxnRefNo };
}
