import { cacheLife } from "next/cache";
import type { Reservoir, ReservoirHistory, UpstreamReservoir } from "./types";
import { getMockHistory, getMockReservoirs } from "./mock";
import { metaFor } from "./reservoir-meta";

const API_BASE = process.env.OPENDATA_API_BASE ?? "https://opendata.futa.gg";
const USE_MOCK = process.env.USE_MOCK_DATA === "true";

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

async function fetchUpstream<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
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
  "use cache";
  cacheLife("minutes");

  const fetchedAt = new Date().toISOString();

  if (USE_MOCK) {
    return { data: getMockReservoirs(), fetchedAt, source: "mock" };
  }

  try {
    const raw = await fetchUpstream<UpstreamReservoir[]>("/reservoirs");
    const data = raw.map(mapUpstream);
    return { data, fetchedAt, source: "live" };
  } catch {
    return { data: getMockReservoirs(), fetchedAt, source: "mock" };
  }
}

export async function getReservoirHistory(
  id: string,
): Promise<ReservoirHistory> {
  "use cache";
  cacheLife("hours");

  if (USE_MOCK) return getMockHistory(id);

  try {
    return await fetchUpstream<ReservoirHistory>(
      `/reservoirs/${encodeURIComponent(id)}/history`,
    );
  } catch {
    return getMockHistory(id);
  }
}
