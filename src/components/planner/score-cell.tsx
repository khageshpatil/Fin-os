import React from "react";

interface ScoreCellProps {
  label: string;
  value: number;
  highlight?: boolean;
  delta?: boolean;
}

export function ScoreCell({ label, value, highlight, delta }: ScoreCellProps) {
  const display = delta ? `${value > 0 ? "+" : ""}${value}` : value;
  const color = delta
    ? value > 0
      ? "text-success"
      : value < 0
        ? "text-destructive"
        : "text-muted-foreground"
    : "";

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition-all ${
        highlight
          ? "border-foreground/30 bg-background/60"
          : "border-border/60 bg-background/40"
      }`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1.5 text-3xl font-bold tracking-tight tabular-nums ${color}`}>
        {display}
      </div>
    </div>
  );
}
