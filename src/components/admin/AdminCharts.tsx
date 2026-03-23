"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface StatusPoint {
  status: string;
  count: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  payment_pending: "#f59e0b",
  payment_failed: "#ff3b30",
  confirmed: "#16a34a",
  processing: "#0071e3",
  shipped: "#6366f1",
  delivered: "#34c759",
  cancelled: "#ff3b30",
  refunded: "#6e6e73",
};

export function AdminCharts({
  revenueData,
  statusData,
}: {
  revenueData: RevenuePoint[];
  statusData: StatusPoint[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
      {/* Revenue Line Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-[#d2d2d7] p-5">
        <h2 className="font-semibold text-[15px] text-[#1d1d1f] mb-4">Revenue — Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f7" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#6e6e73" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6e6e73" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `₨${(v / 1000).toFixed(0)}k` : `₨${v}`
              }
              width={48}
            />
            <Tooltip
              formatter={(value) => [`₨${Number(value).toLocaleString("en-PK")}`, "Revenue"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #d2d2d7",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#0071e3"
              strokeWidth={2}
              dot={{ r: 3, fill: "#0071e3" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders by Status Donut Chart */}
      <div className="bg-white rounded-2xl border border-[#d2d2d7] p-5">
        <h2 className="font-semibold text-[15px] text-[#1d1d1f] mb-4">Orders by Status</h2>
        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="45%"
                outerRadius={70}
                innerRadius={42}
                paddingAngle={2}
              >
                {statusData.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] ?? "#6e6e73"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #d2d2d7",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-sm text-[#6e6e73]">
            No orders yet
          </div>
        )}
      </div>
    </div>
  );
}
