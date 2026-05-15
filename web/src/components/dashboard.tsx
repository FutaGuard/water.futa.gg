"use client";

import { useEffect, useState } from "react";
import type {
  NationalTrend,
  Reservoir,
  UpstreamReservoir,
} from "@/lib/types";
import {
  aggregateNationalTrend,
  mapUpstream,
  pickLatestValidByName,
  pickTrendTargets,
} from "@/lib/reservoir";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { Hero } from "./hero";
import { StatOverview } from "./stat-overview";
import { RegionPulse } from "./region-pulse";
import { TopReservoirsChart } from "./top-reservoirs-chart";
import { TrendChart } from "./trend-chart";
import { ReservoirExplorer } from "./reservoir-explorer";

const API_BASE = "https://opendata.futa.gg";

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!res.ok) throw new Error(`Upstream ${res.status} on ${path}`);
  return (await res.json()) as T;
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-6">
      <div className="skeleton-shimmer h-44 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-28 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton-shimmer h-72 rounded-2xl" />
      <div className="skeleton-shimmer h-40 rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="mx-auto mt-4 h-16 max-w-7xl rounded-2xl skeleton-shimmer" />
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto mt-10 max-w-2xl px-4">
      <div className="glass-card rounded-2xl border border-error/30 p-6 text-sm">
        <div className="mb-2 font-bold text-error">無法取得即時水情資料</div>
        <p className="text-base-content/70">
          上游 API 連線失敗，請稍後重整頁面。
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-base-200/60 px-3 py-2 text-xs text-base-content/70">
          {message}
        </pre>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [reservoirs, setReservoirs] = useState<Reservoir[] | null>(null);
  const [trend, setTrend] = useState<NationalTrend | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const end = new Date();
        const snapshotStart = new Date(end.getTime() - 3 * 24 * 60 * 60 * 1000);
        const snapshotParams = new URLSearchParams({
          start: snapshotStart.toISOString(),
          end: end.toISOString(),
          limit: "5000",
        });
        const raw = await fetchJson<UpstreamReservoir[]>(
          `/reservoirs?${snapshotParams.toString()}`,
          controller.signal,
        );
        const data = pickLatestValidByName(raw).map(mapUpstream);
        setReservoirs(data);
        setFetchedAt(new Date().toISOString());

        const targets = pickTrendTargets(data);
        const trendStart = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        const histories = await Promise.allSettled(
          targets.map((r) => {
            const params = new URLSearchParams({
              name: r.name,
              start: trendStart.toISOString(),
              end: end.toISOString(),
              limit: "5000",
            });
            return fetchJson<UpstreamReservoir[]>(
              `/reservoirs?${params.toString()}`,
              controller.signal,
            );
          }),
        );
        setTrend(aggregateNationalTrend(targets, histories));
      } catch (e: unknown) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => controller.abort();
  }, []);

  if (error && !reservoirs) {
    return (
      <>
        <HeaderSkeleton />
        <ErrorState message={error} />
      </>
    );
  }

  if (!reservoirs) {
    return (
      <>
        <HeaderSkeleton />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <SiteHeader fetchedAt={fetchedAt ?? new Date().toISOString()} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 pb-10 pt-6">
        <Hero reservoirs={reservoirs} />
        <StatOverview reservoirs={reservoirs} />
        {trend && <TrendChart trend={trend} />}
        <RegionPulse reservoirs={reservoirs} />
        <TopReservoirsChart reservoirs={reservoirs} />
        <ReservoirExplorer reservoirs={reservoirs} />
      </main>
      <SiteFooter />
    </>
  );
}
