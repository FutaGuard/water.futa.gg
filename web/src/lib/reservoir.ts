import type { NationalTrend, Reservoir, UpstreamReservoir } from "./types";
import { metaFor } from "./reservoir-meta";

export const TRENDS_TOP_N = 10;

function classify(percent: number): Reservoir["status"] {
  if (!Number.isFinite(percent)) return "unknown";
  if (percent >= 95) return "full";
  if (percent >= 50) return "normal";
  if (percent >= 25) return "low";
  return "critical";
}

export function mapUpstream(item: UpstreamReservoir): Reservoir {
  const meta = metaFor(item.name);
  const hasStorage =
    item.capavailable != null &&
    item.currcap != null &&
    item.currcapper != null;
  const percentage = hasStorage ? Number(item.currcapper) : NaN;
  return {
    id: String(item.id),
    name: item.name,
    region: meta.region,
    county: meta.county,
    fullWaterLevel: meta.fullWaterLevel,
    fullCapacity: Number(item.capavailable ?? 0),
    currentStorage: Number(item.currcap ?? 0),
    percentage: hasStorage ? percentage : 0,
    waterLevel: Number(item.caplevel ?? 0),
    waterLevelDiff: item.waterlevediff,
    rainfall: Number(item.rainFall ?? 0),
    inflow: Number(item.inFlow ?? 0),
    outflow: Number(item.outFlow ?? 0),
    status: hasStorage ? classify(percentage) : "unknown",
    hasStorage,
    observationTime: item.recordTime,
    statisticPeriod: { start: item.statisticTimeS, end: item.statisticTimeE },
  };
}

export function pickLatestValidByName(
  records: UpstreamReservoir[],
): UpstreamReservoir[] {
  const latest = new Map<string, { time: number; record: UpstreamReservoir }>();
  for (const r of records) {
    if (
      r.name == null ||
      r.recordTime == null ||
      r.capavailable == null ||
      r.currcap == null ||
      r.currcapper == null
    ) {
      continue;
    }
    const t = new Date(r.recordTime).getTime();
    if (!Number.isFinite(t)) continue;
    const existing = latest.get(r.name);
    if (!existing || t > existing.time) {
      latest.set(r.name, { time: t, record: r });
    }
  }
  return Array.from(latest.values()).map((v) => v.record);
}

export function pickTrendTargets(reservoirs: Reservoir[]): Reservoir[] {
  return reservoirs
    .filter((r) => r.hasStorage && r.fullCapacity > 0)
    .sort((a, b) => b.fullCapacity - a.fullCapacity)
    .slice(0, TRENDS_TOP_N);
}

const TAIPEI_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function taipeiDate(iso: string): string {
  return TAIPEI_DATE.format(new Date(iso));
}

export function aggregateNationalTrend(
  targets: Reservoir[],
  histories: PromiseSettledResult<UpstreamReservoir[]>[],
): NationalTrend {
  const buckets = new Map<string, { storage: number; capacity: number }>();
  let contributors = 0;

  histories.forEach((result, i) => {
    if (result.status !== "fulfilled") return;
    contributors += 1;
    const reservoir = targets[i];
    const latestPerDate = new Map<
      string,
      { time: number; percentage: number }
    >();
    for (const record of result.value) {
      if (record.recordTime == null || record.currcapper == null) continue;
      const t = new Date(record.recordTime).getTime();
      const percentage = Number(record.currcapper);
      if (!Number.isFinite(t) || !Number.isFinite(percentage)) continue;
      const date = taipeiDate(record.recordTime);
      const existing = latestPerDate.get(date);
      if (!existing || t > existing.time) {
        latestPerDate.set(date, { time: t, percentage });
      }
    }
    for (const [date, { percentage }] of latestPerDate) {
      const bucket = buckets.get(date) ?? { storage: 0, capacity: 0 };
      bucket.storage += (percentage / 100) * reservoir.fullCapacity;
      bucket.capacity += reservoir.fullCapacity;
      buckets.set(date, bucket);
    }
  });

  const points = Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, { storage, capacity }]) => ({
      date,
      percentage:
        capacity > 0 ? Math.round((storage / capacity) * 1000) / 10 : 0,
    }));

  return { points, contributors };
}
