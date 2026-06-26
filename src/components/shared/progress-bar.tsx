// Animated progress bar with color thresholds.

export function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const barColor =
    clamped >= 90 ? "bg-success" : clamped >= 50 ? "bg-warning" : "bg-destructive";

  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-muted/40 ${className}`}>
      <div
        className={`h-full rounded-full ${barColor}`}
        style={{
          width: `${clamped}%`,
          transition: "width 600ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );
}
