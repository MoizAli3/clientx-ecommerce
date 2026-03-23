"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegisterSchema, LoginSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

export async function registerAction(
  formData: FormData
): Promise<ApiResponse<null>> {
  const raw = {
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { success: false, data: null, error: firstError.message };
  }

  const { full_name, email, phone, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, phone },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { success: false, data: null, error: "This email is already registered." };
    }
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null };
}

export async function loginAction(
  formData: FormData
): Promise<ApiResponse<null>> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, data: null, error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { success: false, data: null, error: "Email not confirmed. Please check your inbox and click the verification link." };
    }
    if (error.message.toLowerCase().includes("invalid login") || error.message.toLowerCase().includes("invalid credentials")) {
      return { success: false, data: null, error: "Incorrect email or password." };
    }
    // Show actual error in dev so it's debuggable
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function getSessionUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
