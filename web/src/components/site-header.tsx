import Link from "next/link";

export function SiteHeader({ fetchedAt }: { fetchedAt: string }) {
  const fmt = new Intl.DateTimeFormat("zh-Hant", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(fetchedAt));

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass-card mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-2xl px-5 py-3 shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-content shadow-md shadow-primary/30">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 3.2c3.6 4.2 6 7.4 6 10.4a6 6 0 1 1-12 0c0-3 2.4-6.2 6-10.4Z" />
              <path d="M9 14.6c.4 1.4 1.6 2.4 3 2.4" opacity=".55" />
            </svg>
          </span>
          <div className="leading-tight">
            <div className="text-lg font-extrabold tracking-tight">
              water<span className="text-primary">.futa.gg</span>
            </div>
            <div className="text-xs text-base-content/60">
              台灣水庫即時水情視覺化
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-base-content/10 bg-base-100/50 px-3 py-1.5 text-xs sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="font-medium">資料更新</span>
            <span className="font-mono text-base-content/70">{fmt}</span>
          </div>
          <a
            href="https://github.com/FutaGuard/SunsetRollercoaster"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-ghost rounded-full"
          >
            API
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M7 17 17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
