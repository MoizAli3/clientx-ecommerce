"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check } from "lucide-react";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await registerAction(new FormData(e.currentTarget));
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? "Registration fail ho gayi. Dobara try karein.");
        setLoading(false);
      }
    } catch {
      setError("Server se connection nahi ho pa raha. Dobara try karein.");
      setLoading(false);
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
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">
            Account ban gaya! 🎉
          </h2>
          <p className="text-sm text-[#6e6e73] mb-6">
            Apni email check karo aur account verify karo, phir sign in karo.
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
          <Link href="/" className="text-2xl font-semibold text-[#1d1d1f]">
            ClientX
          </Link>
          <p className="text-[#6e6e73] mt-2 text-[15px]">Naya account banao</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#d2d2d7] p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
                Full Name
              </label>
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
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
                Email
              </label>
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
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="03001234567"
                className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none transition-all text-[15px] placeholder:text-[#aeaeb2]"
              />
              <p className="text-xs text-[#aeaeb2] mt-1">
                Pakistani mobile number (03XXXXXXXXX)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
                Password
              </label>
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
                Kam az kam 8 characters, 1 capital letter, 1 number
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
          Pehle se account hai?{" "}
          <Link
            href="/auth/login"
            className="text-[#0071e3] hover:underline font-medium"
          >
            Sign in karo
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
