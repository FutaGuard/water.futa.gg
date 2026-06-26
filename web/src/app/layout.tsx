import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const themeInitScript = `
(() => {
  const storageKey = "water-theme-mode";
  const lightTheme = "bumblebee";
  const darkTheme = "night";
  const allowedModes = new Set(["system", "light", "dark"]);
  let mode = "system";

  try {
    const storedMode = window.localStorage.getItem(storageKey);
    if (allowedModes.has(storedMode)) {
      mode = storedMode;
    }
  } catch {}

  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolvedTheme = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme === "dark" ? darkTheme : lightTheme;
  root.dataset.themeMode = mode;
  root.style.colorScheme = resolvedTheme;
})();
`;

export const metadata: Metadata = {
  title: "台灣水庫即時水情 · water.futa.gg",
  description:
    "整合經濟部水利署開放資料的台灣水庫即時水情視覺化儀表板，由 SunsetRollercoaster 提供 API。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      data-theme="bumblebee"
      data-theme-mode="system"
      suppressHydrationWarning
      className={`${notoSansTC.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
