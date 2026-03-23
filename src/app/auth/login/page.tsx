"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@supabase/ssr";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(
    searchParams.get("error") === "oauth"
      ? `Sign-in failed: ${searchParams.get("msg") ?? "Please try again or use email."}`
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await loginAction(new FormData(e.currentTarget));
      if (result.success) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(result.error ?? "Login failed. Please try again.");
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
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-semibold text-[#1d1d1f]">
            MaxWatches
          </Link>
          <p className="text-[#6e6e73] mt-2 text-[15px]">Sign in to your account</p>
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
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
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
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6e6e73] mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-[#0071e3] hover:underline font-medium">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
          <div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
