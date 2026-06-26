import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/shared/section-heading";
import { FreshnessBadge, StaleFieldsList } from "@/components/shared/freshness-badge";
import { ScoreHero } from "@/components/dashboard/score-hero";
import { WeakestRuleCallout } from "@/components/dashboard/weakest-rule";
import { TopActions } from "@/components/dashboard/top-actions";
import { ScoreTrendChart } from "@/components/dashboard/score-trend";
import { BudgetBreakdown } from "@/components/dashboard/budget-breakdown";
import { ScoreBreakdown } from "@/components/dashboard/score-breakdown";
import { PublicLanding } from "@/components/dashboard/public-landing";

import { useProfile } from "@/lib/profile/store";
import { useHistory, recordCheckIn } from "@/lib/profile/history";
import { evaluateRules, disciplineScore, topActions } from "@/lib/rules/engine";
import { hasBudgetCategories } from "@/lib/profile/types";

export const Route = createFileRoute("/")(
  {
    head: () => ({
      meta: [
        { title: "Dashboard — WealthOS" },
        {
          name: "description",
          content:
            "Your financial discipline score and next best actions.",
        },
      ],
    }),
    component: Dashboard,
  },
);

function Dashboard() {
  const [profile] = useProfile();
  const history = useHistory();
  const rules = useMemo(() => evaluateRules(profile), [profile]);
  const score = useMemo(() => disciplineScore(rules), [rules]);
  const actions = useMemo(() => topActions(rules), [rules]);
  const setupReady = profile.onboardingComplete && profile.monthlyIncome > 0;

  // -----------------------------------------------------------------------
  // Empty state — onboarding not complete
  // -----------------------------------------------------------------------
  if (!setupReady) {
    return <PublicLanding />;
  }

  // -----------------------------------------------------------------------
  // Main dashboard — redesigned hierarchy:
  // Score → Weakest Rule → Top Actions → Trend → Budget → Score Breakdown
  // -----------------------------------------------------------------------
  return (
    <PageShell
      eyebrow="Dashboard"
      title="Financial Discipline"
      description="A single, opinionated score across nine proven rules."
      actions={
        <div className="flex items-center gap-2">
          <FreshnessBadge profile={profile} />
          <button
            type="button"
            onClick={() =>
              recordCheckIn(profile, evaluateRules, disciplineScore, topActions)
            }
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90"
          >
            Log check-in
          </button>
          <Link
            to="/planner"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-accent"
          >
            Simulate <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      }
    >
      {/* Row 1: Score hero + Weakest rule */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ScoreHero score={score} cappedReason={score.cappedReason} />
        <WeakestRuleCallout rules={rules} />
      </section>

      {/* Stale fields warning */}
      <section className="mt-4">
        <StaleFieldsList profile={profile} />
      </section>

      {/* Row 2: Top actions */}
      <section className="mt-8">
        <SectionHeading
          title="Top action items"
          subtitle="The three highest-impact moves you can make next"
        />
        <div className="mt-4">
          <TopActions actions={actions} />
        </div>
      </section>

      {/* Row 3: Score trend */}
      <section className="mt-8">
        <SectionHeading
          title="Score trend"
          subtitle="Your discipline score over time"
        />
        <div className="mt-4">
          <ScoreTrendChart history={history} />
        </div>
      </section>

      {/* Row 4: Budget breakdown (conditional) */}
      {hasBudgetCategories(profile) && (
        <section className="mt-8">
          <SectionHeading
            title="Budget breakdown"
            subtitle="Your needs, wants, and savings split"
          />
          <div className="mt-4">
            <BudgetBreakdown profile={profile} />
          </div>
        </section>
      )}

      {/* Row 5: All 9 rules */}
      <section className="mt-10">
        <SectionHeading
          title="Score breakdown"
          subtitle="All nine rules, scored individually"
        />
        <div className="mt-4">
          <ScoreBreakdown rules={rules} />
        </div>
      </section>
    </PageShell>
  );
}
