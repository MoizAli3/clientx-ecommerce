import type { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending:         { label: "Pending",         bg: "#fff8e1", text: "#f59e0b" },
  payment_pending: { label: "Payment Pending",  bg: "#fff8e1", text: "#f59e0b" },
  payment_failed:  { label: "Payment Failed",   bg: "#fff0f0", text: "#ff3b30" },
  confirmed:       { label: "Confirmed",        bg: "#f0fdf4", text: "#16a34a" },
  processing:      { label: "Processing",       bg: "#eff6ff", text: "#0071e3" },
  shipped:         { label: "Shipped",          bg: "#eff6ff", text: "#0071e3" },
  delivered:       { label: "Delivered",        bg: "#f0fdf4", text: "#16a34a" },
  cancelled:       { label: "Cancelled",        bg: "#fff0f0", text: "#ff3b30" },
  refunded:        { label: "Refunded",         bg: "#f5f5f7", text: "#6e6e73" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, bg: "#f5f5f7", text: "#6e6e73" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}
