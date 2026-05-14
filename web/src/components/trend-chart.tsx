"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NationalTrend } from "@/lib/types";

type Range = 7 | 30;

const RANGE_LABEL: Record<Range, string> = {
  7: "近 7 日",
  30: "近 30 日",
};

const SHORT_DATE = new Intl.DateTimeFormat("zh-Hant", {
  timeZone: "Asia/Taipei",
  month: "numeric",
  day: "numeric",
});

const FULL_DATE = new Intl.DateTimeFormat("zh-Hant", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function parseDate(iso: string): Date {
  return new Date(`${iso}T00:00:00+08:00`);
}

export function TrendChart({ trend }: { trend: NationalTrend }) {
  const [range, setRange] = useState<Range>(7);

  const data = useMemo(() => {
    const sliced = trend.points.slice(-range);
    return sliced.map((p) => ({
      date: p.date,
      percentage: p.percentage,
      label: SHORT_DATE.format(parseDate(p.date)),
    }));
  }, [trend.points, range]);

  const latest = data.at(-1);
  const first = data.at(0);
  const delta =
    latest && first ? latest.percentage - first.percentage : 0;
  const deltaSign = delta > 0 ? "▲" : delta < 0 ? "▼" : "■";
  const deltaClass =
    delta > 0
      ? "text-success"
      : delta < 0
        ? "text-error"
        : "text-base-content/60";

  if (data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 text-sm text-base-content/60">
        暫無歷史資料。
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight">
            主要水庫蓄水率趨勢
          </h2>
          <p className="text-xs text-base-content/60">
            依容量加權平均 · 取前 {trend.contributors} 大水庫
            <span className="mx-1 text-base-content/30">·</span>
            <span className={`font-mono font-semibold ${deltaClass}`}>
              {deltaSign} {Math.abs(delta).toFixed(1)}%
            </span>{" "}
            較區間起始
          </p>
        </div>
        <div role="tablist" className="tabs tabs-box bg-base-100/60">
          {([7, 30] as const).map((r) => (
            <button
              key={r}
              role="tab"
              type="button"
              aria-selected={range === r}
              className={`tab ${range === r ? "tab-active" : ""}`}
              onClick={() => setRange(r)}
            >
              {RANGE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 16, right: 12, bottom: 4, left: -16 }}
          >
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.45}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="color-mix(in oklch, var(--color-base-content) 12%, transparent)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{
                fontSize: 11,
                fill: "var(--color-base-content)",
                opacity: 0.7,
              }}
              tickLine={false}
              axisLine={false}
              minTickGap={range === 30 ? 24 : 8}
            />
            <YAxis
              domain={["dataMin - 2", "dataMax + 2"]}
              tickFormatter={(v) => `${Math.round(Number(v))}%`}
              tick={{
                fontSize: 11,
                fill: "var(--color-base-content)",
                opacity: 0.7,
              }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              cursor={{
                stroke:
                  "color-mix(in oklch, var(--color-base-content) 18%, transparent)",
                strokeWidth: 1,
              }}
              contentStyle={{
                background: "var(--color-base-100)",
                border:
                  "1px solid color-mix(in oklch, var(--color-base-content) 12%, transparent)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelFormatter={(_, payload) => {
                const item = payload?.[0]?.payload as
                  | { date: string }
                  | undefined;
                if (!item) return "";
                return FULL_DATE.format(parseDate(item.date));
              }}
              formatter={(value) => [
                typeof value === "number" ? `${value.toFixed(1)}%` : `${value}`,
                "蓄水率",
              ]}
            />
            <Area
              type="monotone"
              dataKey="percentage"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              fill="url(#trendFill)"
              dot={range <= 7 ? { r: 3 } : false}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
