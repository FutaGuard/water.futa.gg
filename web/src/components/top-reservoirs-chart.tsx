"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Reservoir } from "@/lib/types";

function pickColor(pct: number): string {
  if (pct >= 75) return "var(--color-success)";
  if (pct >= 50) return "var(--color-primary)";
  if (pct >= 25) return "var(--color-warning)";
  return "var(--color-error)";
}

export function TopReservoirsChart({ reservoirs }: { reservoirs: Reservoir[] }) {
  const data = [...reservoirs]
    .filter((r) => r.hasStorage)
    .sort((a, b) => b.fullCapacity - a.fullCapacity)
    .slice(0, 10)
    .map((r) => ({
      name: r.name,
      percent: r.percentage,
      capacity: r.fullCapacity,
    }));

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-base font-bold tracking-tight">主要水庫蓄水率</h2>
        <span className="text-xs text-base-content/60">依總容量排序前 10 大</span>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 16, right: 8, bottom: 4, left: -16 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="color-mix(in oklch, var(--color-base-content) 12%, transparent)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              interval={0}
              angle={-22}
              textAnchor="end"
              height={64}
              tick={{
                fontSize: 11,
                fill: "var(--color-base-content)",
                opacity: 0.8,
              }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{
                fontSize: 11,
                fill: "var(--color-base-content)",
                opacity: 0.7,
              }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{
                fill: "color-mix(in oklch, var(--color-base-content) 6%, transparent)",
              }}
              contentStyle={{
                background: "var(--color-base-100)",
                border:
                  "1px solid color-mix(in oklch, var(--color-base-content) 12%, transparent)",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value) => [
                typeof value === "number" ? `${value.toFixed(1)}%` : `${value}`,
                "蓄水率",
              ]}
            />
            <Bar dataKey="percent" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={pickColor(entry.percent)} />
              ))}
              <LabelList
                dataKey="percent"
                position="top"
                formatter={(v) => (typeof v === "number" ? `${v.toFixed(0)}%` : "")}
                fontSize={11}
                fill="var(--color-base-content)"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
