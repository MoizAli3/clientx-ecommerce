"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/actions/orders";
import type { OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = [
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"
];

export function AdminOrderStatusUpdate({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as OrderStatus;
    setLoading(true);
    await updateOrderStatusAction({ order_id: orderId, status });
    router.refresh();
    setLoading(false);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={loading}
      className="text-xs px-2 py-1.5 rounded-lg bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] disabled:opacity-50 transition-colors"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="capitalize">{s}</option>
      ))}
    </select>
  );
}
