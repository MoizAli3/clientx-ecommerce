import type { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending:         { label: "Pending",         bg: "#f59e0b", text: "#ffffff" },
  payment_pending: { label: "Payment Pending",  bg: "#f59e0b", text: "#ffffff" },
  payment_failed:  { label: "Payment Failed",   bg: "#ff3b30", text: "#ffffff" },
  confirmed:       { label: "Confirmed",        bg: "#34c759", text: "#ffffff" },
  processing:      { label: "Processing",       bg: "#0071e3", text: "#ffffff" },
  shipped:         { label: "Shipped",          bg: "#0071e3", text: "#ffffff" },
  delivered:       { label: "Delivered",        bg: "#16a34a", text: "#ffffff" },
  cancelled:       { label: "Cancelled",        bg: "#ff3b30", text: "#ffffff" },
  refunded:        { label: "Refunded",         bg: "#6e6e73", text: "#ffffff" },
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
