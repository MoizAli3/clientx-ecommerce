"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@supabase/ssr";

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await registerAction(new FormData(e.currentTarget));
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? "Registration failed. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Cannot connect to server. Please try again.");
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "facebook") {
    setOauthLoading(provider);
    setError("");
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-sm border border-[#d2d2d7] p-10 max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 bg-[#34c759]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-[#34c759]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">Account Created!</h2>
          <p className="text-sm text-[#6e6e73] mb-6">
            Check your email and verify your account, then sign in.
          </p>
          <Link href="/auth/login">
            <Button className="w-full">Sign In</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-semibold text-[#1d1d1f]">MaxWatches</Link>
          <p className="text-[#6e6e73] mt-2 text-[15px]">Create a new account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#d2d2d7] p-7">
          {/* Social login */}
          <div className="space-y-3 mb-5">
            <button
              onClick={() => handleOAuth("google")}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#d2d2d7] bg-white hover:bg-[#f5f5f7] text-[15px] font-medium text-[#1d1d1f] transition-colors disabled:opacity-60"
            >
              {oauthLoading === "google" ? (
                <span className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaGoogle size={16} className="text-[#EA4335]" />
              )}
              Continue with Google
            </button>

            <button
              onClick={() => handleOAuth("facebook")}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#d2d2d7] bg-white hover:bg-[#f5f5f7] text-[15px] font-medium text-[#1d1d1f] transition-colors disabled:opacity-60"
            >
              {oauthLoading === "facebook" ? (
                <span className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaFacebook size={16} className="text-[#1877F2]" />
              )}
              Continue with Facebook
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#d2d2d7]" />
            <span className="text-xs text-[#aeaeb2] font-medium">or</span>
            <div className="flex-1 h-px bg-[#d2d2d7]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Full Name</label>
              <input
                name="full_name"
                type="text"
                required
                autoComplete="name"
                placeholder="Ali Ahmed"
                className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none transition-all text-[15px] placeholder:text-[#aeaeb2]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="ali@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none transition-all text-[15px] placeholder:text-[#aeaeb2]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Phone Number</label>
              <input
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="03001234567"
                className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none transition-all text-[15px] placeholder:text-[#aeaeb2]"
              />
              <p className="text-xs text-[#aeaeb2] mt-1">Pakistani mobile number (03XXXXXXXXX)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none transition-all text-[15px] placeholder:text-[#aeaeb2]"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e6e73] hover:text-[#1d1d1f] p-1.5 rounded-full hover:bg-[#f5f5f7] transition-colors"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-[#aeaeb2] mt-1">
                Minimum 8 characters, 1 uppercase letter, 1 number
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-[#ff3b30] bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-xl px-4 py-3"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6e6e73] mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#0071e3] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
