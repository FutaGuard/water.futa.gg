"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Reservoir, UpstreamReservoir } from "@/lib/types";
import { formatNumber, formatPercent, formatTime } from "@/lib/format";

const API_BASE = "https://opendata.futa.gg";
const MAX_HISTORY_DAYS = 180;
type HistoryRange = 7 | 30 | 90 | 180;

const RANGE_OPTIONS: { days: HistoryRange; label: string }[] = [
  { days: 7, label: "7 天" },
  { days: 30, label: "30 天" },
  { days: 90, label: "90 天" },
  { days: 180, label: "半年" },
];

const SHORT_DATE = new Intl.DateTimeFormat("zh-Hant", {
  timeZone: "Asia/Taipei",
  month: "2-digit",
  day: "2-digit",
});

const SHORT_DATETIME = new Intl.DateTimeFormat("zh-Hant", {
  timeZone: "Asia/Taipei",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
});

const FULL_DATETIME = new Intl.DateTimeFormat("zh-Hant", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

interface HistoryPoint {
  id: string;
  iso: string;
  label: string;
  fullLabel: string;
  percentage: number | null;
  storage: number | null;
  capacity: number | null;
  waterLevel: number | null;
  waterLevelDiff: number | null;
  rainfall: number | null;
  inflow: number | null;
  outflow: number | null;
}

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!res.ok) throw new Error(`Upstream ${res.status} on ${path}`);
  return (await res.json()) as T;
}

function toNumber(value: number | null | undefined): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toHistoryPoint(record: UpstreamReservoir, range: HistoryRange): HistoryPoint | null {
  if (!record.recordTime) return null;
  const time = new Date(record.recordTime);
  const timestamp = time.getTime();
  if (!Number.isFinite(timestamp)) return null;

  return {
    id: `${record.id}-${timestamp}`,
    iso: record.recordTime,
    label: range <= 30 ? SHORT_DATETIME.format(time) : SHORT_DATE.format(time),
    fullLabel: FULL_DATETIME.format(time),
    percentage: toNumber(record.currcapper),
    storage: toNumber(record.currcap),
    capacity: toNumber(record.capavailable),
    waterLevel: toNumber(record.caplevel),
    waterLevelDiff: toNumber(record.waterlevediff),
    rainfall: toNumber(record.rainFall),
    inflow: toNumber(record.inFlow),
    outflow: toNumber(record.outFlow),
  };
}

function lastValue(points: HistoryPoint[], key: keyof HistoryPoint): number | null {
  for (let i = points.length - 1; i >= 0; i -= 1) {
    const value = points[i][key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function firstValue(points: HistoryPoint[], key: keyof HistoryPoint): number | null {
  for (const point of points) {
    const value = point[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function metric(value: unknown, digits = 1, unit = ""): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${formatNumber(value, digits)}${unit}`;
}

function percentMetric(value: unknown): string {
  return typeof value === "number" ? formatPercent(value) : "—";
}

const gridStroke =
  "color-mix(in oklch, var(--color-base-content) 12%, transparent)";
const cursorStroke =
  "color-mix(in oklch, var(--color-base-content) 18%, transparent)";
const tooltipStyle = {
  background: "var(--color-base-100)",
  border:
    "1px solid color-mix(in oklch, var(--color-base-content) 12%, transparent)",
  borderRadius: 12,
  fontSize: 12,
};

function ChartPanel({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-base-content/10 bg-base-100/55 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-bold tracking-tight">{title}</h3>
        <p className="text-xs text-base-content/55">{hint}</p>
      </div>
      <div className="h-72 w-full">{children}</div>
    </section>
  );
}

function AxisText() {
  return {
    fontSize: 11,
    fill: "var(--color-base-content)",
    opacity: 0.72,
  };
}

function EmptyHistory({ reservoir }: { reservoir: Reservoir }) {
  return (
    <div className="rounded-2xl border border-dashed border-base-content/20 bg-base-100/55 p-8 text-center text-sm text-base-content/60">
      {reservoir.name} 目前沒有這個區間的歷史資料。
    </div>
  );
}

export function ReservoirHistoryModal({
  reservoir,
  onClose,
}: {
  reservoir: Reservoir | null;
  onClose: () => void;
}) {
  const [range, setRange] = useState<HistoryRange>(30);
  const [history, setHistory] = useState<HistoryPoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reservoir) return;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setHistory(null);
      setError(null);
      try {
        const end = new Date();
        const days = Math.min(range, MAX_HISTORY_DAYS);
        const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
        const params = new URLSearchParams({
          name: reservoir.name,
          start: start.toISOString(),
          end: end.toISOString(),
          limit: "5000",
        });
        const records = await fetchJson<UpstreamReservoir[]>(
          `/reservoirs?${params.toString()}`,
          controller.signal,
        );
        const points = records
          .slice()
          .sort(
            (a, b) =>
              new Date(a.recordTime).getTime() - new Date(b.recordTime).getTime(),
          )
          .map((record) => toHistoryPoint(record, range))
          .filter((point): point is HistoryPoint => point != null);
        setHistory(points);
      } catch (e: unknown) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [reservoir, range]);

  useEffect(() => {
    if (!reservoir) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, reservoir]);

  const summary = useMemo(() => {
    const points = history ?? [];
    const firstPercent = firstValue(points, "percentage");
    const latestPercent = lastValue(points, "percentage");
    const delta =
      firstPercent != null && latestPercent != null
        ? latestPercent - firstPercent
        : null;
    const rainfallTotal = points.reduce(
      (sum, point) => sum + (point.rainfall ?? 0),
      0,
    );
    const latestInflow = lastValue(points, "inflow");
    const latestOutflow = lastValue(points, "outflow");
    return {
      latestPercent,
      delta,
      rainfallTotal,
      latestInflow,
      latestOutflow,
      latestStorage: lastValue(points, "storage"),
      latestWaterLevel: lastValue(points, "waterLevel"),
      latestTime: points.at(-1)?.iso,
    };
  }, [history]);

  if (!reservoir) return null;

  const deltaClass =
    summary.delta == null
      ? "text-base-content/60"
      : summary.delta > 0
        ? "text-success"
        : summary.delta < 0
          ? "text-error"
          : "text-base-content/60";
  const deltaSign =
    summary.delta == null ? "—" : summary.delta > 0 ? "▲" : summary.delta < 0 ? "▼" : "■";

  return (
    <div className="modal modal-open">
      <div className="modal-box max-h-[92vh] w-11/12 max-w-6xl overflow-y-auto rounded-2xl p-0">
        <div className="sticky top-0 z-10 border-b border-base-content/10 bg-base-100/95 px-5 py-4 backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">
                  {reservoir.name}
                </h2>
                <span className="badge badge-primary badge-sm border-0">
                  {reservoir.region}
                </span>
                <span className="badge badge-ghost badge-sm">
                  {reservoir.county}
                </span>
              </div>
              <p className="text-xs text-base-content/60">
                最新觀測 {formatTime(reservoir.observationTime)}
                {summary.latestTime && (
                  <>
                    <span className="mx-1 text-base-content/30">·</span>
                    歷史更新至 {formatTime(summary.latestTime)}
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div role="tablist" className="tabs tabs-box bg-base-200/70">
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.days}
                    role="tab"
                    type="button"
                    aria-selected={range === option.days}
                    className={`tab ${range === option.days ? "tab-active" : ""}`}
                    onClick={() => setRange(option.days)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-circle btn-ghost btn-sm"
                aria-label="關閉"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="stats stats-vertical w-full overflow-hidden rounded-2xl border border-base-content/10 bg-base-100/55 shadow-none lg:stats-horizontal">
            <div className="stat">
              <div className="stat-title">區間蓄水率</div>
              <div className="stat-value text-2xl">
                {summary.latestPercent != null
                  ? formatPercent(summary.latestPercent)
                  : "—"}
              </div>
              <div className={`stat-desc font-mono ${deltaClass}`}>
                {summary.delta == null
                  ? "—"
                  : `${deltaSign} ${Math.abs(summary.delta).toFixed(1)}%`}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">有效蓄水量</div>
              <div className="stat-value text-2xl">
                {summary.latestStorage != null
                  ? formatNumber(summary.latestStorage, 1)
                  : "—"}
              </div>
              <div className="stat-desc">萬 m³</div>
            </div>
            <div className="stat">
              <div className="stat-title">水位</div>
              <div className="stat-value text-2xl">
                {summary.latestWaterLevel != null
                  ? formatNumber(summary.latestWaterLevel, 1)
                  : "—"}
              </div>
              <div className="stat-desc">m</div>
            </div>
            <div className="stat">
              <div className="stat-title">累積降雨量</div>
              <div className="stat-value text-2xl">
                {formatNumber(summary.rainfallTotal, 1)}
              </div>
              <div className="stat-desc">mm</div>
            </div>
          </div>

          {loading && (
            <div className="grid min-h-80 place-items-center rounded-2xl border border-base-content/10 bg-base-100/55">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          )}

          {error && !loading && (
            <div className="alert alert-error">
              <span>歷史資料載入失敗：{error}</span>
            </div>
          )}

          {!loading && !error && history?.length === 0 && (
            <EmptyHistory reservoir={reservoir} />
          )}

          {!loading && !error && history && history.length > 0 && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <ChartPanel title="蓄水率與有效蓄水量" hint="百分比與萬立方公尺雙軸對照">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={history}
                    margin={{ top: 16, right: 4, bottom: 4, left: -14 }}
                  >
                    <defs>
                      <linearGradient id="historyPercentFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.42} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={AxisText()}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={range <= 30 ? 28 : 42}
                    />
                    <YAxis
                      yAxisId="percent"
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tick={AxisText()}
                      tickLine={false}
                      axisLine={false}
                      width={46}
                    />
                    <YAxis
                      yAxisId="storage"
                      orientation="right"
                      tickFormatter={(value) => `${Math.round(Number(value))}`}
                      tick={AxisText()}
                      tickLine={false}
                      axisLine={false}
                      width={52}
                    />
                    <Tooltip
                      cursor={{ stroke: cursorStroke, strokeWidth: 1 }}
                      contentStyle={tooltipStyle}
                      labelFormatter={(_, payload) =>
                        (payload?.[0]?.payload as HistoryPoint | undefined)?.fullLabel ?? ""
                      }
                      formatter={(value, name) => {
                        if (name === "蓄水率") return [percentMetric(value), name];
                        return [metric(value, 1, " 萬 m³"), name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area
                      yAxisId="percent"
                      type="monotone"
                      dataKey="percentage"
                      name="蓄水率"
                      stroke="var(--color-primary)"
                      strokeWidth={2.5}
                      fill="url(#historyPercentFill)"
                      dot={false}
                      connectNulls
                    />
                    <Line
                      yAxisId="storage"
                      type="monotone"
                      dataKey="storage"
                      name="有效蓄水量"
                      stroke="var(--color-info)"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="水位變化" hint="即時水位與滿水位參考線">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={history}
                    margin={{ top: 16, right: 8, bottom: 4, left: -14 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={AxisText()}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={range <= 30 ? 28 : 42}
                    />
                    <YAxis
                      domain={["dataMin - 1", "dataMax + 1"]}
                      tick={AxisText()}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                    />
                    <Tooltip
                      cursor={{ stroke: cursorStroke, strokeWidth: 1 }}
                      contentStyle={tooltipStyle}
                      labelFormatter={(_, payload) =>
                        (payload?.[0]?.payload as HistoryPoint | undefined)?.fullLabel ?? ""
                      }
                      formatter={(value, name) => [metric(value, 2, " m"), name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {reservoir.fullWaterLevel != null && (
                      <ReferenceLine
                        y={reservoir.fullWaterLevel}
                        label="滿水位"
                        stroke="var(--color-warning)"
                        strokeDasharray="4 4"
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="waterLevel"
                      name="水位"
                      stroke="var(--color-success)"
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="入流與出流" hint="水庫流量 cms 歷史曲線">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={history}
                    margin={{ top: 16, right: 8, bottom: 4, left: -14 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={AxisText()}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={range <= 30 ? 28 : 42}
                    />
                    <YAxis
                      tick={AxisText()}
                      tickLine={false}
                      axisLine={false}
                      width={54}
                    />
                    <Tooltip
                      cursor={{ stroke: cursorStroke, strokeWidth: 1 }}
                      contentStyle={tooltipStyle}
                      labelFormatter={(_, payload) =>
                        (payload?.[0]?.payload as HistoryPoint | undefined)?.fullLabel ?? ""
                      }
                      formatter={(value, name) => [metric(value, 1, " cms"), name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="inflow"
                      name="入流"
                      stroke="var(--color-info)"
                      strokeWidth={2.3}
                      dot={false}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="outflow"
                      name="出流"
                      stroke="var(--color-error)"
                      strokeWidth={2.3}
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="降雨量" hint="集水區每筆觀測降雨量">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={history}
                    margin={{ top: 16, right: 8, bottom: 4, left: -14 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={AxisText()}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={range <= 30 ? 28 : 42}
                    />
                    <YAxis
                      tick={AxisText()}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                    />
                    <Tooltip
                      cursor={{
                        fill: "color-mix(in oklch, var(--color-base-content) 6%, transparent)",
                      }}
                      contentStyle={tooltipStyle}
                      labelFormatter={(_, payload) =>
                        (payload?.[0]?.payload as HistoryPoint | undefined)?.fullLabel ?? ""
                      }
                      formatter={(value, name) => [metric(value, 1, " mm"), name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="rainfall"
                      name="降雨量"
                      fill="var(--color-secondary)"
                      radius={[6, 6, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="waterLevelDiff"
                      name="水位差"
                      stroke="var(--color-accent)"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-base-content/50">
            <span>最多載入 {MAX_HISTORY_DAYS} 天內資料。</span>
            <span>
              入流 {metric(summary.latestInflow, 1, " cms")} · 出流{" "}
              {metric(summary.latestOutflow, 1, " cms")}
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="modal-backdrop"
        aria-label="關閉歷史資料"
        onClick={onClose}
      />
    </div>
  );
}
