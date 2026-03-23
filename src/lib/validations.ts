import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  full_name: z.string().min(2, "Naam kam az kam 2 characters ka hona chahiye"),
  email: z.string().email("Valid email address daalen"),
  phone: z
    .string()
    .regex(/^(\+92|0)3[0-9]{9}$/, "Valid Pakistani phone number daalen (e.g. 03001234567)"),
  password: z
    .string()
    .min(8, "Password kam az kam 8 characters ka hona chahiye")
    .regex(/[A-Z]/, "Password mein kam az kam ek capital letter hona chahiye")
    .regex(/[0-9]/, "Password mein kam az kam ek number hona chahiye"),
});

export const LoginSchema = z.object({
  email: z.string().email("Valid email address daalen"),
  password: z.string().min(1, "Password daalen"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Profile ───────────────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(2, "Naam kam az kam 2 characters ka hona chahiye"),
  phone: z
    .string()
    .regex(/^(\+92|0)3[0-9]{9}$/, "Valid Pakistani phone number daalen")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ─── Shipping Address ──────────────────────────────────────────────────────────

export const ShippingAddressSchema = z.object({
  full_name: z.string().min(2, "Poora naam daalen"),
  phone: z
    .string()
    .min(10, "Valid phone number daalen")
    .max(15, "Phone number bahut lamba hai"),
  address_line1: z.string().min(5, "Ghar ka address daalen"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "Shehar ka naam daalen"),
  province: z.enum(
    ["Punjab", "Sindh", "KPK", "Balochistan", "Gilgit-Baltistan", "AJK", "Islamabad"],
    { error: "Province select karo" }
  ),
  postal_code: z.string().optional(),
});

export type ShippingAddressInput = z.infer<typeof ShippingAddressSchema>;

// ─── Order ─────────────────────────────────────────────────────────────────────

export const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid("Invalid product ID"),
        quantity: z.number().int().min(1, "Quantity kam az kam 1 honi chahiye"),
      })
    )
    .min(1, "Cart mein kam az kam ek item hona chahiye"),
  payment_method: z.enum(["jazzcash", "easypaisa", "cod"]),
  shipping_address: ShippingAddressSchema,
  notes: z.string().max(500).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum([
    "pending",
    "payment_pending",
    "payment_failed",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

// ─── Product (Admin) ───────────────────────────────────────────────────────────

export const ProductSchema = z.object({
  name: z.string().min(2, "Product ka naam daalen"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug mein sirf lowercase letters, numbers aur hyphens allowed hain"),
  description: z.string().min(10, "Description thori lambi karein"),
  price: z.number().positive("Price zero se zyada hona chahiye"),
  sale_price: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0, "Stock negative nahi ho sakta"),
  sku: z.string().min(2, "SKU daalen"),
  category_id: z.string().uuid("Category select karo"),
  images: z.array(z.string().url()).optional().default([]),
  is_active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof ProductSchema>;

// ─── Category (Admin) ──────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  name: z.string().min(2, "Category ka naam daalen"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug mein sirf lowercase letters, numbers aur hyphens allowed hain"),
  image_url: z.string().url().optional().nullable(),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof CategorySchema>;

// ─── Payment Callback ──────────────────────────────────────────────────────────

export const JazzCashCallbackSchema = z.object({
  pp_ResponseCode: z.string(),
  pp_ResponseMessage: z.string().optional(),
  pp_TxnRefNo: z.string(),
  pp_SecureHash: z.string(),
  pp_BillReference: z.string(),       // order_id
  pp_Amount: z.string(),
}).passthrough();

export const EasyPaisaCallbackSchema = z.object({
  orderRefNum: z.string(),
  storeId: z.string(),
  amount: z.string(),
  paymentStatus: z.string().optional(),
  status: z.string().optional(),
  storeIdHash: z.string(),
  expiryDate: z.string(),
  postBackURL: z.string(),
}).passthrough();
