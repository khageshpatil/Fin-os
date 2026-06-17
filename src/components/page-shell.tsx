import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </div>
          )}
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}
