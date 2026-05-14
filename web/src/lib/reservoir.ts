import type {
  NationalTrend,
  Reservoir,
  ReservoirHistory,
  UpstreamReservoir,
} from "./types";
import { getMockHistory, getMockReservoirs } from "./mock";
import { metaFor } from "./reservoir-meta";

const API_BASE = process.env.OPENDATA_API_BASE ?? "https://opendata.futa.gg";
const USE_MOCK = process.env.USE_MOCK_DATA === "true";
const RESERVOIRS_REVALIDATE_SECONDS = 60;
const HISTORY_REVALIDATE_SECONDS = 60 * 60;

function classify(percent: number): Reservoir["status"] {
  if (!Number.isFinite(percent)) return "unknown";
  if (percent >= 95) return "full";
  if (percent >= 50) return "normal";
  if (percent >= 25) return "low";
  return "critical";
}

function mapUpstream(item: UpstreamReservoir): Reservoir {
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

async function fetchUpstream<T>(
  path: string,
  revalidate: number,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate },
    });
    if (!res.ok) throw new Error(`Upstream ${res.status} on ${path}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getReservoirs(): Promise<{
  data: Reservoir[];
  fetchedAt: string;
  source: "live" | "mock";
}> {
  const fetchedAt = new Date().toISOString();

  if (USE_MOCK) {
    return { data: getMockReservoirs(), fetchedAt, source: "mock" };
  }

  try {
    const raw = await fetchUpstream<UpstreamReservoir[]>(
      "/reservoirs",
      RESERVOIRS_REVALIDATE_SECONDS,
    );
    const data = raw.map(mapUpstream);
    return { data, fetchedAt, source: "live" };
  } catch {
    return { data: getMockReservoirs(), fetchedAt, source: "mock" };
  }
}

export async function getReservoirHistory(
  id: string,
): Promise<ReservoirHistory> {
  if (USE_MOCK) return getMockHistory(id);

  try {
    return await fetchUpstream<ReservoirHistory>(
      `/reservoirs/${encodeURIComponent(id)}/history`,
      HISTORY_REVALIDATE_SECONDS,
    );
  } catch {
    return getMockHistory(id);
  }
}

const TRENDS_TOP_N = 10;
const TAIPEI_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function taipeiDate(iso: string): string {
  return TAIPEI_DATE.format(new Date(iso));
}

export async function getNationalTrend(
  reservoirs: Reservoir[],
): Promise<NationalTrend> {
  const targets = reservoirs
    .filter((r) => r.hasStorage && r.fullCapacity > 0)
    .sort((a, b) => b.fullCapacity - a.fullCapacity)
    .slice(0, TRENDS_TOP_N);

  if (targets.length === 0) {
    return { points: [], contributors: 0 };
  }

  const histories = await Promise.all(
    targets.map((r) => getReservoirHistory(r.id)),
  );

  const buckets = new Map<string, { storage: number; capacity: number }>();

  histories.forEach((history, i) => {
    const reservoir = targets[i];
    const latestPerDate = new Map<string, { time: number; percentage: number }>();
    for (const point of history.points) {
      const t = new Date(point.observationTime).getTime();
      if (!Number.isFinite(t) || !Number.isFinite(point.percentage)) continue;
      const date = taipeiDate(point.observationTime);
      const existing = latestPerDate.get(date);
      if (!existing || t > existing.time) {
        latestPerDate.set(date, { time: t, percentage: point.percentage });
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

  return { points, contributors: targets.length };
}
