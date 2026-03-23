import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^(\+92|0)3[0-9]{9}$/, "Please enter a valid Pakistani phone number (e.g. 03001234567)"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Profile ───────────────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^(\+92|0)3[0-9]{9}$/, "Please enter a valid Pakistani phone number")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ─── Shipping Address ──────────────────────────────────────────────────────────

export const ShippingAddressSchema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(15, "Phone number is too long"),
  address_line1: z.string().min(5, "Please enter your street address"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "Please enter your city"),
  province: z.enum(
    ["Punjab", "Sindh", "KPK", "Balochistan", "Gilgit-Baltistan", "AJK", "Islamabad"],
    { error: "Please select a province" }
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
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "Your cart must have at least one item"),
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
  name: z.string().min(2, "Please enter the product name"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be greater than zero"),
  sale_price: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().min(2, "Please enter a SKU"),
  category_id: z.string().uuid("Please select a category"),
  images: z.array(z.string().url()).optional().default([]),
  is_active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof ProductSchema>;

// ─── Category (Admin) ──────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  name: z.string().min(2, "Please enter the category name"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
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
