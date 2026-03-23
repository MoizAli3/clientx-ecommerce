"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ProductSchema, CategorySchema } from "@/lib/validations";
import type { ApiResponse, Product, Category } from "@/types";

// ─── Auth guard helper ─────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin" ? user : null;
}

// ─── Products ──────────────────────────────────────────────────────────────────

export async function createProductAction(
  payload: unknown
): Promise<ApiResponse<{ id: string }>> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, data: { id: "" }, error: "Sirf admin yeh kar sakta hai" };

  const parsed = ProductSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, data: { id: "" }, error: parsed.error.issues[0].message };
  }

  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase
    .from("products")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("unique")) {
      return { success: false, data: { id: "" }, error: "Yeh slug ya SKU pehle se exist karta hai" };
    }
    return { success: false, data: { id: "" }, error: error.message };
  }

  revalidatePath("/products");
  revalidatePath("/admin/products");

  return { success: true, data: { id: data.id } };
}

export async function updateProductAction(
  id: string,
  payload: unknown
): Promise<ApiResponse<null>> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, data: null, error: "Sirf admin yeh kar sakta hai" };

  const parsed = ProductSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return { success: false, data: null, error: parsed.error.issues[0].message };
  }

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase
    .from("products")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { success: false, data: null, error: error.message };

  revalidatePath("/products");
  revalidatePath(`/products/${parsed.data.slug ?? id}`);
  revalidatePath("/admin/products");

  return { success: true, data: null };
}

export async function deleteProductAction(id: string): Promise<ApiResponse<null>> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, data: null, error: "Sirf admin yeh kar sakta hai" };

  // Soft delete — just set is_active = false (preserves order history)
  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return { success: false, data: null, error: error.message };

  revalidatePath("/products");
  revalidatePath("/admin/products");

  return { success: true, data: null };
}

export async function uploadProductImageAction(
  formData: FormData
): Promise<ApiResponse<{ url: string }>> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, data: { url: "" }, error: "Sirf admin yeh kar sakta hai" };

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, data: { url: "" }, error: "File select karo" };

  // Validate type + size
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, data: { url: "" }, error: "Sirf JPG, PNG ya WebP allowed hai" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, data: { url: "" }, error: "Image 5MB se kam honi chahiye" };
  }

  const adminSupabase = await createAdminClient();
  const ext = file.name.split(".").pop();
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await adminSupabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { success: false, data: { url: "" }, error: error.message };

  const { data: { publicUrl } } = adminSupabase.storage
    .from("product-images")
    .getPublicUrl(path);

  return { success: true, data: { url: publicUrl } };
}

// ─── Categories ────────────────────────────────────────────────────────────────

export async function createCategoryAction(
  payload: unknown
): Promise<ApiResponse<{ id: string }>> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, data: { id: "" }, error: "Sirf admin yeh kar sakta hai" };

  const parsed = CategorySchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, data: { id: "" }, error: parsed.error.issues[0].message };
  }

  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase
    .from("categories")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("unique")) {
      return { success: false, data: { id: "" }, error: "Yeh slug pehle se exist karta hai" };
    }
    return { success: false, data: { id: "" }, error: error.message };
  }

  revalidatePath("/products");
  revalidatePath("/admin/products");

  return { success: true, data: { id: data.id } };
}

export async function updateCategoryAction(
  id: string,
  payload: unknown
): Promise<ApiResponse<null>> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, data: null, error: "Sirf admin yeh kar sakta hai" };

  const parsed = CategorySchema.partial().safeParse(payload);
  if (!parsed.success) {
    return { success: false, data: null, error: parsed.error.issues[0].message };
  }

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase
    .from("categories")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { success: false, data: null, error: error.message };

  revalidatePath("/products");
  revalidatePath("/admin/products");

  return { success: true, data: null };
}
