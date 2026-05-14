import { Suspense } from "react";
import { getNationalTrend, getReservoirs } from "@/lib/reservoir";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { StatOverview } from "@/components/stat-overview";
import { RegionPulse } from "@/components/region-pulse";
import { TopReservoirsChart } from "@/components/top-reservoirs-chart";
import { TrendChart } from "@/components/trend-chart";
import { ReservoirExplorer } from "@/components/reservoir-explorer";

export const revalidate = 60;

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4">
      <div className="skeleton-shimmer h-44 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-28 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton-shimmer h-40 rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

async function Dashboard() {
  const { data } = await getReservoirs();
  const trend = await getNationalTrend(data);

  return (
    <>
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 pb-10 pt-6">
        <Hero reservoirs={data} />
        <StatOverview reservoirs={data} />
        <TrendChart trend={trend} />
        <RegionPulse reservoirs={data} />
        <TopReservoirsChart reservoirs={data} />
        <ReservoirExplorer reservoirs={data} />
      </main>
      <SiteFooter />
    </>
  );
}

async function Header() {
  const { fetchedAt } = await getReservoirs();
  return <SiteHeader fetchedAt={fetchedAt} />;
}

export default function Home() {
  return (
    <>
      <Suspense
        fallback={
          <div className="mx-auto mt-4 h-16 max-w-7xl rounded-2xl skeleton-shimmer" />
        }
      >
        <Header />
      </Suspense>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </>
  );
}
