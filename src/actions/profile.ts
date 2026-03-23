"use server";

import { createClient } from "@/lib/supabase/server";
import { UpdateProfileSchema } from "@/lib/validations";
import type { ApiResponse, User } from "@/types";

export async function updateProfileAction(
  formData: FormData
): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "Login karein pehle" };
  }

  const raw = {
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || undefined,
  };

  const parsed = UpdateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, data: null, error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id);

  if (error) {
    return { success: false, data: null, error: "Profile update nahi ho saki" };
  }

  return { success: true, data: null };
}

export async function getProfileAction(): Promise<ApiResponse<User | null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: data as User };
}
