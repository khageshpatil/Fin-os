import React from "react";
import { LucideIcon } from "lucide-react";

interface ScenarioCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export function ScenarioCard({
  title,
  description,
  icon: Icon,
  isActive,
  onClick,
}: ScenarioCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border p-5 text-left transition-all cursor-pointer ${
        isActive
          ? "border-foreground bg-card shadow-sm"
          : "border-border bg-card/40 hover:border-foreground/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <Icon
          className={`h-4.5 w-4.5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
        />
        {isActive && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-success">
            Active
          </span>
        )}
      </div>
      <div className="mt-4 text-sm font-semibold tracking-tight">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground leading-normal">{description}</div>
    </button>
  );
}
