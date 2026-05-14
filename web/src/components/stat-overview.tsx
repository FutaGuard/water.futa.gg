import type { Reservoir } from "@/lib/types";
import { formatNumber, formatPercent } from "@/lib/format";

export function StatOverview({ reservoirs }: { reservoirs: Reservoir[] }) {
  const tracked = reservoirs.filter((r) => r.hasStorage);
  const total = tracked.length;
  const totalCapacity = tracked.reduce((s, r) => s + r.fullCapacity, 0);
  const totalStorage = tracked.reduce((s, r) => s + r.currentStorage, 0);
  const nationalPct =
    totalCapacity > 0 ? (totalStorage / totalCapacity) * 100 : 0;
  const critical = tracked.filter((r) => r.status === "critical").length;
  const low = tracked.filter((r) => r.status === "low").length;

  const cards = [
    {
      label: "全國蓄水率",
      value: formatPercent(nationalPct),
      hint: `${formatNumber(totalStorage)} / ${formatNumber(totalCapacity)} 萬 m³`,
      accent: "from-warning/60 to-primary/30",
    },
    {
      label: "監測水庫",
      value: `${total}`,
      hint: "座 · 全台主要水庫",
      accent: "from-primary/60 to-warning/20",
    },
    {
      label: "偏低水庫",
      value: `${low}`,
      hint: "蓄水率介於 25–50%",
      accent: "from-warning/70 to-warning/10",
    },
    {
      label: "警戒水庫",
      value: `${critical}`,
      hint: "蓄水率低於 25%",
      accent: "from-error/60 to-error/10",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="glass-card relative overflow-hidden rounded-2xl p-5"
        >
          <div
            aria-hidden
            className={`pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${c.accent} blur-2xl`}
          />
          <div className="relative">
            <div className="text-xs font-medium text-base-content/60">
              {c.label}
            </div>
            <div className="mt-1 font-mono text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl">
              {c.value}
            </div>
            <div className="mt-1 text-xs text-base-content/60">{c.hint}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
