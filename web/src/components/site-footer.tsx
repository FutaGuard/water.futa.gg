export function SiteFooter({ source }: { source: "live" | "mock" }) {
  return (
    <footer className="mx-auto mt-16 mb-10 w-full max-w-7xl px-4 text-sm text-base-content/70">
      <div className="glass-card flex flex-col gap-2 rounded-2xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          資料來源：經濟部水利署開放資料平台 · 透過{" "}
          <a
            href="https://github.com/FutaGuard/SunsetRollercoaster"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-hover font-medium"
          >
            SunsetRollercoaster
          </a>{" "}
          整合
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">資料狀態</span>
          <span
            className={`badge badge-sm ${
              source === "live" ? "badge-success" : "badge-warning"
            }`}
          >
            {source === "live" ? "上游連線中" : "範例資料"}
          </span>
        </div>
      </div>
    </footer>
  );
}
