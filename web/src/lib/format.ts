export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function formatNumber(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("zh-Hant", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("zh-Hant", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function statusColor(
  status: "normal" | "low" | "critical" | "full" | "unknown",
): { text: string; ring: string; chip: string } {
  switch (status) {
    case "full":
      return {
        text: "text-info",
        ring: "ring-info/40",
        chip: "bg-info/20 text-info-content",
      };
    case "normal":
      return {
        text: "text-success",
        ring: "ring-success/40",
        chip: "bg-success/20 text-success-content",
      };
    case "low":
      return {
        text: "text-warning",
        ring: "ring-warning/50",
        chip: "bg-warning/30 text-warning-content",
      };
    case "critical":
      return {
        text: "text-error",
        ring: "ring-error/50",
        chip: "bg-error/25 text-error-content",
      };
    default:
      return {
        text: "text-base-content/60",
        ring: "ring-base-content/20",
        chip: "bg-base-200 text-base-content",
      };
  }
}

export function statusLabel(
  status: "normal" | "low" | "critical" | "full" | "unknown",
): string {
  switch (status) {
    case "full":
      return "滿水位";
    case "normal":
      return "正常";
    case "low":
      return "偏低";
    case "critical":
      return "警戒";
    default:
      return "未知";
  }
}
