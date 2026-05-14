export function SiteFooter() {
  return (
    <footer className="mx-auto mt-16 mb-10 w-full max-w-7xl px-4 text-sm text-base-content/70">
      <div className="glass-card rounded-2xl px-5 py-4">
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
    </footer>
  );
}
