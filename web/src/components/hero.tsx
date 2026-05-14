import type { Reservoir } from "@/lib/types";
import { formatPercent } from "@/lib/format";

export function Hero({ reservoirs }: { reservoirs: Reservoir[] }) {
  const tracked = reservoirs.filter((r) => r.hasStorage);
  const totalCap = tracked.reduce((s, r) => s + r.fullCapacity, 0);
  const totalStorage = tracked.reduce((s, r) => s + r.currentStorage, 0);
  const pct = totalCap > 0 ? (totalStorage / totalCap) * 100 : 0;
  const lowest = [...tracked].sort((a, b) => a.percentage - b.percentage)[0];

  return (
    <section className="glass-card relative overflow-hidden rounded-3xl px-6 py-8 sm:px-10 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 240px at 12% 0%, color-mix(in oklch, var(--color-warning) 35%, transparent), transparent 70%), radial-gradient(420px 200px at 95% 110%, color-mix(in oklch, var(--color-primary) 30%, transparent), transparent 70%)",
        }}
      />
      <div className="relative grid items-end gap-8 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100/60 px-3 py-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>台灣水庫即時水情</span>
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            一眼看懂今天的{" "}
            <span className="bg-gradient-to-br from-primary via-warning to-primary bg-clip-text text-transparent">
              全國水情
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-base-content/70 sm:text-base">
            整合經濟部水利署開放資料，以視覺化方式呈現全台 {reservoirs.length}{" "}
            座主要水庫的蓄水率、入流出流與降雨資訊；資料由 SunsetRollercoaster
            每小時抓取彙整。
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-base-content/55">
              全國蓄水率
            </div>
            <div className="font-mono text-6xl font-black leading-none tabular-nums">
              {formatPercent(pct, 1)}
            </div>
            {lowest && (
              <div className="mt-2 text-xs text-base-content/60">
                最低：{lowest.name} ·{" "}
                <span className="font-mono">
                  {formatPercent(lowest.percentage, 1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
