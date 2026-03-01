export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const BIAS_OPTIONS = ["LONG", "SHORT", "NEUTRAL"] as const;
export const MARKET_STRUCTURE_OPTIONS = ["BULLISH", "BEARISH", "RANGING"] as const;
export const EMOTIONAL_STATES = ["CALM", "ANXIOUS", "FOMO", "REVENGE", "CONFIDENT"] as const;
export const TRADE_STATUS = ["OPEN", "CLOSED_WIN", "CLOSED_LOSS", "CLOSED_BE", "CANCELLED"] as const;
export const SETUP_TYPES = [
  "BOS_RETEST",
  "FVG_FILL",
  "ORDER_BLOCK",
  "LIQUIDITY_SWEEP",
  "SUPPLY_DEMAND",
  "TRENDLINE_BREAK",
  "SUPPORT_RESISTANCE",
  "OTHER",
] as const;

export function getBiasColor(bias: string): string {
  switch (bias) {
    case "LONG":
    case "BULLISH":
      return "text-emerald-400";
    case "SHORT":
    case "BEARISH":
      return "text-red-400";
    default:
      return "text-yellow-400";
  }
}

export function getBiasBg(bias: string): string {
  switch (bias) {
    case "LONG":
    case "BULLISH":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "SHORT":
    case "BEARISH":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  }
}
