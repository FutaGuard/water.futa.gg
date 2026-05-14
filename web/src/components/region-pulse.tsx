import type { Reservoir, Region } from "@/lib/types";
import { formatPercent } from "@/lib/format";

const ORDER: Region[] = ["北部", "中部", "南部", "東部", "離島"];

function tone(pct: number) {
  if (pct >= 75) return "bg-success";
  if (pct >= 50) return "bg-primary";
  if (pct >= 25) return "bg-warning";
  return "bg-error";
}

export function RegionPulse({ reservoirs }: { reservoirs: Reservoir[] }) {
  const groups = new Map<Region, Reservoir[]>();
  for (const r of reservoirs) {
    if (!r.hasStorage) continue;
    if (!groups.has(r.region)) groups.set(r.region, []);
    groups.get(r.region)!.push(r);
  }

  const summaries = ORDER.filter((r) => groups.has(r)).map((region) => {
    const items = groups.get(region)!;
    const cap = items.reduce((s, x) => s + x.fullCapacity, 0);
    const stor = items.reduce((s, x) => s + x.currentStorage, 0);
    const pct = cap > 0 ? (stor / cap) * 100 : 0;
    return { region, count: items.length, pct };
  });

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-base font-bold tracking-tight">分區蓄水脈動</h2>
        <span className="text-xs text-base-content/60">
          以區域加權平均蓄水率
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {summaries.map((s) => (
          <div
            key={s.region}
            className="rounded-xl border border-base-content/5 bg-base-100/60 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{s.region}</span>
              <span className="text-xs text-base-content/60">
                {s.count} 座
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1 font-mono">
              <span className="text-2xl font-extrabold tabular-nums">
                {formatPercent(s.pct, 1)}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-base-300/60">
              <div
                className={`h-full ${tone(s.pct)} transition-[width] duration-700`}
                style={{ width: `${Math.min(100, Math.max(0, s.pct))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
