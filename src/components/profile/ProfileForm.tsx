"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/actions/profile";
import type { User } from "@/types";

export function ProfileForm({ profile }: { profile: User }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateProfileAction(fd);
      if (res.success) {
        setSuccess(true);
        setEditing(false);
      } else {
        setError(res.error ?? "Could not update profile.");
      }
    });
  };

  return (
    <div className="bg-white border border-[#d2d2d7] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#d2d2d7] bg-[#f5f5f7] flex items-center justify-between">
        <p className="text-sm font-semibold text-[#1d1d1f]">Personal Info</p>
        {!editing && (
          <button
            onClick={() => { setEditing(true); setSuccess(false); }}
            className="text-sm text-[#0071e3] hover:underline font-medium"
          >
            Edit
          </button>
        )}
      </div>

      {success && (
        <div className="mx-5 mt-4 bg-[#34c759]/10 border border-[#34c759]/30 text-[#16a34a] text-sm px-4 py-3 rounded-xl">
          Profile update ho gayi!
        </div>
      )}
      {error && (
        <div className="mx-5 mt-4 bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#ff3b30] text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Full Name</label>
            <input
              name="full_name"
              defaultValue={profile.full_name}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071e3] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Phone</label>
            <input
              name="phone"
              defaultValue={profile.phone ?? ""}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071e3] transition-colors"
              placeholder="03001234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Email</label>
            <input
              value={profile.email}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] text-sm bg-[#f5f5f7] text-[#6e6e73] cursor-not-allowed"
            />
            <p className="text-xs text-[#6e6e73] mt-1">Email cannot be changed</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-[#0071e3] text-white text-sm font-semibold rounded-full hover:bg-[#0077ed] transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setError(""); }}
              className="px-5 py-2 bg-[#f5f5f7] text-[#1d1d1f] text-sm font-medium rounded-full hover:bg-[#e8e8ed] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="px-5 py-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#6e6e73]">Name</span>
            <span className="font-medium text-[#1d1d1f]">{profile.full_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6e6e73]">Email</span>
            <span className="font-medium text-[#1d1d1f]">{profile.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6e6e73]">Phone</span>
            <span className="font-medium text-[#1d1d1f]">{profile.phone ?? "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6e6e73]">Member since</span>
            <span className="font-medium text-[#1d1d1f]">
              {new Date(profile.created_at).toLocaleDateString("en-PK", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
