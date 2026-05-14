"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { Region, Reservoir } from "@/lib/types";
import { ReservoirCard } from "./reservoir-card";

type SortKey = "percent-asc" | "percent-desc" | "capacity-desc" | "name-asc";

const REGIONS: (Region | "全部")[] = [
  "全部",
  "北部",
  "中部",
  "南部",
  "東部",
  "離島",
];

const SORT_LABEL: Record<SortKey, string> = {
  "percent-asc": "蓄水率（低 → 高）",
  "percent-desc": "蓄水率（高 → 低）",
  "capacity-desc": "容量（大 → 小）",
  "name-asc": "名稱（A → Z）",
};

export function ReservoirExplorer({ reservoirs }: { reservoirs: Reservoir[] }) {
  const [region, setRegion] = useState<Region | "全部">("全部");
  const [sort, setSort] = useState<SortKey>("percent-asc");
  const [query, setQuery] = useState("");

  const deferred = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    return reservoirs
      .filter((r) => region === "全部" || r.region === region)
      .filter((r) => {
        if (!q) return true;
        return (
          r.name.toLowerCase().includes(q) ||
          r.county.toLowerCase().includes(q) ||
          r.id.includes(q)
        );
      })
      .sort((a, b) => {
        if (a.hasStorage !== b.hasStorage) return a.hasStorage ? -1 : 1;
        switch (sort) {
          case "percent-asc":
            return a.percentage - b.percentage;
          case "percent-desc":
            return b.percentage - a.percentage;
          case "capacity-desc":
            return b.fullCapacity - a.fullCapacity;
          case "name-asc":
            return a.name.localeCompare(b.name, "zh-Hant");
        }
      });
  }, [reservoirs, region, deferred, sort]);

  return (
    <section className="space-y-4">
      <div className="glass-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" className="tabs tabs-box bg-base-100/60">
          {REGIONS.map((r) => (
            <button
              key={r}
              role="tab"
              type="button"
              aria-selected={region === r}
              className={`tab ${region === r ? "tab-active" : ""}`}
              onClick={() => setRegion(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <label className="input input-sm input-bordered flex items-center gap-2 rounded-full bg-base-100/70 sm:w-64">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 opacity-60"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋水庫 / 縣市 / ID"
              className="grow bg-transparent outline-none"
            />
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="select select-sm select-bordered rounded-full bg-base-100/70"
          >
            {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-base-content/60">
          沒有符合的水庫，試試其他關鍵字或區域。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <ReservoirCard key={r.id} reservoir={r} />
          ))}
        </div>
      )}
    </section>
  );
}
