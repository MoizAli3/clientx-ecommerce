// ─── User & Auth ───────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: "customer" | "admin";
  created_at: string;
}

// ─── Product ────────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;          // PKR
  sale_price?: number;    // PKR
  stock: number;
  sku: string;
  category_id: string;
  category?: Category;
  images: string[];       // Supabase Storage URLs
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Order ──────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "payment_pending"
  | "payment_failed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "jazzcash" | "easypaisa" | "cod";

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;   // e.g. ORD-2024-001234
  user_id: string;
  user?: User;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_reference?: string;
  shipping_address: ShippingAddress;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ─── Payment ────────────────────────────────────────────────────────────────────
export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  error?: string;
}

export interface JazzCashPayload {
  pp_MerchantID: string;
  pp_Password: string;
  pp_TxnRefNo: string;
  pp_Amount: string;      // in paisa (x100)
  pp_TxnCurrency: string;
  pp_TxnDateTime: string;
  pp_BillReference: string;
  pp_Description: string;
  pp_SecureHash: string;
  pp_TxnExpiryDateTime: string;
  pp_ReturnURL: string;
  pp_Language: string;
  ppmpf_1: string;        // phone number
}

export interface EasyPaisaPayload {
  storeId: string;
  amount: string;
  postBackURL: string;
  orderRefNum: string;
  expiryDate: string;
  autoRedirect: number;
  storeIdHash: string;
}

// ─── API Response ────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
}
