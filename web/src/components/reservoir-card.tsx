import type { Reservoir } from "@/lib/types";
import {
  formatNumber,
  formatTime,
  statusColor,
  statusLabel,
} from "@/lib/format";

function Gauge({
  percent,
  status,
}: {
  percent: number;
  status: Reservoir["status"];
}) {
  const pct = Math.max(0, Math.min(100, percent));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const color = statusColor(status).text;

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="9"
          className="stroke-base-300/70"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${color} drop-shadow-sm transition-[stroke-dashoffset] duration-700 ease-out`}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-mono text-xl font-extrabold leading-none tabular-nums">
            {pct.toFixed(1)}
            <span className="text-[0.6em] font-bold opacity-60">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReservoirCard({ reservoir }: { reservoir: Reservoir }) {
  const c = statusColor(reservoir.status);
  return (
    <article
      className={`glass-card group relative overflow-hidden rounded-2xl p-5 ring-1 ${c.ring} transition-transform hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold tracking-tight">
              {reservoir.name}
            </h3>
            <span className={`badge badge-sm ${c.chip} border-0`}>
              {statusLabel(reservoir.status)}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-base-content/60">
            {reservoir.region} · {reservoir.county}
          </div>
        </div>
        {reservoir.hasStorage ? (
          <Gauge percent={reservoir.percentage} status={reservoir.status} />
        ) : (
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border border-dashed border-base-content/20 text-center">
            <div className="px-2 text-[10px] leading-tight text-base-content/55">
              無蓄水<br />監測資料
            </div>
          </div>
        )}
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-base-content/55">
            有效蓄水量
          </dt>
          <dd className="font-mono font-semibold tabular-nums">
            {reservoir.hasStorage ? formatNumber(reservoir.currentStorage) : "—"}
            <span className="ml-1 text-xs font-normal text-base-content/60">
              萬 m³
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-base-content/55">
            總容量
          </dt>
          <dd className="font-mono font-semibold tabular-nums">
            {reservoir.hasStorage ? formatNumber(reservoir.fullCapacity) : "—"}
            <span className="ml-1 text-xs font-normal text-base-content/60">
              萬 m³
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-base-content/55">
            水位 {reservoir.fullWaterLevel != null ? "/ 滿水位" : ""}
          </dt>
          <dd className="font-mono font-semibold tabular-nums">
            {formatNumber(reservoir.waterLevel, 1)}
            {reservoir.fullWaterLevel != null && (
              <>
                <span className="text-base-content/40"> / </span>
                {formatNumber(reservoir.fullWaterLevel, 1)}
              </>
            )}
            <span className="ml-1 text-xs font-normal text-base-content/60">
              m
            </span>
            {reservoir.waterLevelDiff != null && reservoir.waterLevelDiff !== 0 && (
              <span
                className={`ml-1.5 text-[11px] font-semibold ${
                  reservoir.waterLevelDiff > 0 ? "text-success" : "text-error"
                }`}
              >
                {reservoir.waterLevelDiff > 0 ? "▲" : "▼"}
                {Math.abs(reservoir.waterLevelDiff).toFixed(2)}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-base-content/55">
            入流 / 出流
          </dt>
          <dd className="font-mono font-semibold tabular-nums">
            {formatNumber(reservoir.inflow, 1)}
            <span className="text-base-content/40"> / </span>
            {formatNumber(reservoir.outflow, 1)}
            <span className="ml-1 text-xs font-normal text-base-content/60">
              m³/s
            </span>
          </dd>
        </div>
      </dl>

      <footer className="mt-4 flex items-center justify-between text-xs text-base-content/55">
        <span>
          降雨量 · {formatNumber(reservoir.rainfall, 1)}{" "}
          <span className="text-base-content/40">mm</span>
        </span>
        <span className="font-mono">{formatTime(reservoir.observationTime)}</span>
      </footer>

      <div
        aria-hidden
        className={`pointer-events-none absolute -right-12 -bottom-16 h-36 w-36 rounded-full opacity-60 blur-3xl transition-opacity group-hover:opacity-90 ${
          reservoir.status === "critical"
            ? "bg-error/40"
            : reservoir.status === "low"
              ? "bg-warning/40"
              : reservoir.status === "full"
                ? "bg-info/40"
                : "bg-success/30"
        }`}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-5 bottom-3 h-px bg-gradient-to-r from-transparent via-base-content/15 to-transparent"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 fade-mask"
        style={{
          background: `linear-gradient(180deg, transparent, color-mix(in oklch, var(--color-base-100) ${Math.max(8, (reservoir.hasStorage ? reservoir.percentage : 0) / 4)}%, transparent))`,
        }}
      />
    </article>
  );
}
