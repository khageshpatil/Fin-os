export function inr(n: number): string {
  if (!n) return "₹0";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

export function formatDate(iso: string, style: "short" | "medium" = "medium"): string {
  if (!iso) return "";
  if (style === "short") {
    return new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric" }).format(new Date(iso));
  }
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(iso));
}

export function formatPercent(n: number, decimals: number = 0): string {
  return `${n.toFixed(decimals)}%`;
}
