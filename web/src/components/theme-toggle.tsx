"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "water-theme-mode";
const CHANGE_EVENT = "water-theme-change";
const SYSTEM_QUERY = "(prefers-color-scheme: dark)";
const LIGHT_THEME = "bumblebee";
const DARK_THEME = "night";

type ThemeMode = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

const themeOptions: Array<{
  mode: ThemeMode;
  label: string;
  icon: "system" | "sun" | "moon";
}> = [
  { mode: "system", label: "跟隨系統", icon: "system" },
  { mode: "light", label: "淺色", icon: "sun" },
  { mode: "dark", label: "深色", icon: "moon" },
];

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isThemeMode(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function getSystemTheme(): ResolvedTheme {
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(SYSTEM_QUERY).matches
  ) {
    return "dark";
  }

  return "light";
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === "system" ? getSystemTheme() : mode;
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedTheme = resolveTheme(mode);
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme === "dark" ? DARK_THEME : LIGHT_THEME;
  root.dataset.themeMode = mode;
  root.style.colorScheme = resolvedTheme;
}

function readSnapshot() {
  const mode = getStoredThemeMode();
  const resolvedTheme = resolveTheme(mode);
  return `${mode}:${resolvedTheme}`;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const media =
    typeof window.matchMedia === "function"
      ? window.matchMedia(SYSTEM_QUERY)
      : null;

  const syncTheme = () => {
    applyTheme(getStoredThemeMode());
    onStoreChange();
  };

  const syncSystemTheme = () => {
    if (getStoredThemeMode() === "system") {
      syncTheme();
    }
  };

  const syncStorageTheme = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      syncTheme();
    }
  };

  window.addEventListener(CHANGE_EVENT, syncTheme);
  window.addEventListener("storage", syncStorageTheme);

  if (media) {
    media.addEventListener("change", syncSystemTheme);
  }

  applyTheme(getStoredThemeMode());

  return () => {
    window.removeEventListener(CHANGE_EVENT, syncTheme);
    window.removeEventListener("storage", syncStorageTheme);

    if (media) {
      media.removeEventListener("change", syncSystemTheme);
    }
  };
}

function setThemeMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage may be unavailable in private browsing; applying in-memory still works.
  }

  applyTheme(mode);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function ThemeIcon({ icon }: { icon: "system" | "sun" | "moon" }) {
  if (icon === "system") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8" />
        <path d="M12 16v4" />
      </svg>
    );
  }

  if (icon === "moon") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20.7 14.7A8.2 8.2 0 0 1 9.3 3.3 8.5 8.5 0 1 0 20.7 14.7Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export function ThemeToggle() {
  const snapshot = useSyncExternalStore(
    subscribe,
    readSnapshot,
    () => "system:light",
  );
  const [mode, resolvedTheme] = snapshot.split(":") as [
    ThemeMode,
    ResolvedTheme,
  ];
  const resolvedLabel = resolvedTheme === "dark" ? "深色" : "淺色";
  const currentLabel =
    mode === "system"
      ? `跟隨系統（目前${resolvedLabel}）`
      : resolvedLabel;
  const triggerIcon =
    mode === "system" ? "system" : resolvedTheme === "dark" ? "moon" : "sun";

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        className="btn btn-sm btn-ghost btn-circle"
        aria-label={`主題：${currentLabel}`}
        title={`主題：${currentLabel}`}
      >
        <ThemeIcon icon={triggerIcon} />
      </button>
      <ul
        tabIndex={0}
        className="menu dropdown-content z-50 mt-3 w-44 rounded-box bg-base-100 p-2 text-sm shadow-lg ring-1 ring-base-content/10"
      >
        {themeOptions.map((option) => {
          const selected = option.mode === mode;

          return (
            <li key={option.mode}>
              <button
                type="button"
                className={`justify-between gap-3 ${
                  selected ? "active" : ""
                }`}
                aria-pressed={selected}
                onClick={() => setThemeMode(option.mode)}
              >
                <span className="flex items-center gap-2">
                  <ThemeIcon icon={option.icon} />
                  <span>{option.label}</span>
                </span>
                {selected ? <CheckIcon /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
