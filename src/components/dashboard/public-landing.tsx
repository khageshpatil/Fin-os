import { Link } from "@tanstack/react-router";
import {
  Shield,
  Wallet,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Lock,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle,
  BarChart2,
  Star,
  ChevronRight,
  Heart,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   PublicLanding — a rich, shareable homepage for WealthOS.
   Goals:
     • Explain what WealthOS is to friends & family at a glance
     • Demonstrate the scorecard concept visually
     • Convert visitors to try the free scorecard
     • 100% CSS-only animations — no external animation deps
───────────────────────────────────────────────────────────────────────────── */

export function PublicLanding() {
  return (
    <div
      className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="border-b border-border/60 bg-background/90 backdrop-blur-lg sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="grid h-9 w-9 place-items-center rounded-lg text-background font-black text-base select-none"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
            >
              W
            </div>
            <div>
              <div className="font-bold tracking-tight text-sm leading-tight">WealthOS</div>
              <div className="text-[10px] text-muted-foreground leading-tight">Personal Finance OS</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#how-it-works"
              className="hidden sm:block text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </a>
            <a
              href="#rules"
              className="hidden sm:block text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              The 9 Rules
            </a>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 shadow-sm"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
            >
              Start Free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div
            className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-30 dark:opacity-20 rounded-full animate-pulse-slow"
            style={{ background: "radial-gradient(ellipse, #818cf8 0%, transparent 70%)", filter: "blur(80px)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-20 dark:opacity-10 rounded-full animate-pulse-slow"
            style={{ background: "radial-gradient(ellipse, #a78bfa 0%, transparent 70%)", filter: "blur(60px)", animationDelay: "2s" }}
          />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-8 md:pt-24 md:pb-12 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold mb-6 border animate-fade-up"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.12) 100%)",
              borderColor: "rgba(99,102,241,0.3)",
              color: "#818cf8",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Free · Private · No Bank Login Required
          </div>

          <h1 className="mt-2 text-4xl sm:text-5xl md:text-[3.75rem] font-extrabold tracking-tight leading-[1.08] max-w-4xl mx-auto animate-fade-up-delay-1">
            Your finances, graded
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #ec4899 100%)" }}
            >
              like a report card.
            </span>
          </h1>

          <p className="mt-5 text-base md:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto animate-fade-up-delay-2">
            WealthOS scores your <strong className="text-foreground">financial discipline</strong> across 9 proven rules —
            emergency fund, insurance, investments, and more — giving you a single, actionable number each month.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up-delay-3">
            <Link
              to="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                transition: "all 0.2s ease",
              }}
            >
              Create My Free Scorecard <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-sm font-semibold hover:bg-accent transition-all"
            >
              See a Live Demo
            </a>
          </div>

          <div className="mt-5 text-xs text-muted-foreground flex items-center justify-center gap-5 flex-wrap animate-fade-up-delay-3">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-green-500" />
              100% private — data stays on your device
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-500" />
              Monthly ritual — 5 min/month
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-purple-500" />
              No bank or card login
            </span>
          </div>
        </div>

        {/* Hero mock score cards */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-20 mt-10">
          <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
            <div className="animate-fade-up-delay-1 animate-float">
              <HeroScoreCard score={85} label="Strong" color="#22c55e" gradStart="#166534" gradEnd="#22c55e" description="You're on track — keep the momentum." />
            </div>
            <div className="animate-fade-up-delay-2 animate-float-delayed">
              <HeroScoreCard score={62} label="Needs Attention" color="#f59e0b" gradStart="#92400e" gradEnd="#f59e0b" description="2 rules need urgent fixing this month." featured />
            </div>
            <div className="animate-fade-up-delay-3 animate-float">
              <HeroScoreCard score={41} label="Critical" color="#ef4444" gradStart="#7f1d1d" gradEnd="#ef4444" description="Foundation rules unmet — act now." />
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4 animate-fade-up-delay-3">Sample scorecard ratings — yours will be calculated from your own numbers.</p>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-border/40 bg-muted/20 py-20 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <SectionBadge>How it works</SectionBadge>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
              Simple ritual. Powerful clarity.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              WealthOS is designed for busy people who want to know if they're on the right path — without drowning in spreadsheets.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <StepCard
              step={1}
              icon={<Calendar className="h-5 w-5" />}
              title="Setup once in 5 minutes"
              description="Enter your monthly income, expenses, insurance cover, emergency fund, and investments. All stored privately in your browser — never sent anywhere."
            />
            <StepCard
              step={2}
              icon={<BarChart2 className="h-5 w-5" />}
              title="Get your Discipline Score"
              description="WealthOS grades 9 financial rules across Foundation, Protection, Accumulation, and Process categories. Your score is a number from 0–100."
              highlight
            />
            <StepCard
              step={3}
              icon={<CheckCircle className="h-5 w-5" />}
              title="Act on your prescription"
              description="The dashboard highlights your weakest rule and the single most impactful improvement you can make this month. Execute, then check-in next month."
            />
          </div>
        </div>
      </section>

      {/* ── Philosophy strip ───────────────────────────────────────────────── */}
      <section className="py-16 border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <PhilosophyCard
              icon={<Flame className="h-5 w-5 text-orange-500" />}
              title="Diagnosis, not noise"
              description="&quot;Your emergency fund covers 3.2 months&quot; is more valuable than 50 transaction notifications. WealthOS focuses on what moves the needle."
            />
            <PhilosophyCard
              icon={<Lock className="h-5 w-5 text-green-500" />}
              title="Absolute privacy"
              description="No bank sync. No account needed. No trackers. Your numbers stay in your browser's local storage — forever private."
            />
            <PhilosophyCard
              icon={<Heart className="h-5 w-5 text-red-400" />}
              title="Built for real life"
              description="Designed for salaried professionals. Income hits once a month — so your financial check-up should too, not 24×7."
            />
          </div>
        </div>
      </section>

      {/* ── Live Demo ──────────────────────────────────────────────────────── */}
      <section id="demo" className="py-20 border-t border-border/40 bg-muted/10 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <SectionBadge>Interactive Preview</SectionBadge>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
              What your dashboard looks like
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This is a sample profile. Your real score will be calculated from your own numbers.
            </p>
          </div>

          {/* Dashboard mockup */}
          <div
            className="rounded-2xl border border-border shadow-2xl overflow-hidden max-w-5xl mx-auto relative"
            style={{ boxShadow: "0 25px 80px -20px rgba(99,102,241,0.2)" }}
          >
            {/* Faux browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
              <span className="h-3 w-3 rounded-full bg-red-400/70" />
              <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
              <span className="h-3 w-3 rounded-full bg-green-400/70" />
              <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                wealthos — Dashboard
              </span>
              <span
                className="ml-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
              >
                Demo
              </span>
            </div>

            {/* Mock dashboard layout */}
            <div className="bg-card p-5 md:p-8">
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dashboard</p>
                <h3 className="text-xl md:text-2xl font-extrabold mt-1">Financial Discipline</h3>
                <p className="text-xs text-muted-foreground mt-0.5">A single, opinionated score across nine proven rules.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
                {/* Score ring */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-background p-6 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Financial Discipline
                  </div>
                  <div className="relative mt-4 flex h-32 w-32 items-center justify-center">
                    <svg className="absolute h-full w-full -rotate-90">
                      <circle cx="64" cy="64" r="54" className="stroke-muted-foreground/15" strokeWidth="8" fill="none" />
                      <circle
                        cx="64" cy="64" r="54"
                        stroke="#f59e0b"
                        strokeWidth="9" fill="none"
                        strokeDasharray="339.292"
                        strokeDashoffset="88.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-extrabold tracking-tight tabular-nums">74</span>
                      <span className="text-[10px] font-medium text-muted-foreground">OUT OF 100</span>
                    </div>
                  </div>
                  <div className="mt-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
                    Needs Attention
                  </div>
                  <div className="mt-3 text-[10px] text-muted-foreground leading-relaxed max-w-[160px]">
                    2 foundation rules are not fully met.
                  </div>
                </div>

                {/* Weakest rule + actions */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-900/10 p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> Weakest Rule
                      </div>
                      <span className="rounded text-[10px] font-bold px-1.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">Critical</span>
                    </div>
                    <h4 className="mt-2 text-sm font-bold">Emergency Fund</h4>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-2xl font-extrabold tabular-nums">3.2</span>
                      <span className="text-xs text-muted-foreground mb-1">months / 6 target</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-red-500" style={{ width: "53%" }} />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      Next step: Add ₹1.40 L to your emergency fund to reach the 4-month milestone.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      Top Improvement Actions
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Boost Emergency Fund by ₹1.4L", points: "+10 pts", color: "text-red-500" },
                        { label: "Increase monthly SIP by ₹5,000", points: "+5 pts", color: "text-amber-500" },
                        { label: "Get Term Cover of 12x annual income", points: "+5 pts", color: "text-amber-500" },
                      ].map((action, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-2.5 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-bold text-[9px]"
                              style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
                            >
                              {i + 1}
                            </span>
                            <span className="text-foreground">{action.label}</span>
                          </div>
                          <span className={`font-bold text-[10px] uppercase tracking-wider whitespace-nowrap ${action.color}`}>
                            {action.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 9 rules grid */}
              <div className="mt-6 border-t border-border/50 pt-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  All 9 Scored Rules
                </div>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {[
                    { name: "Emergency Fund", score: "3.2 / 6 mo", pts: "10/20", status: "critical" },
                    { name: "Health Insurance", score: "₹5L / ₹10L", pts: "5/10", status: "warning" },
                    { name: "Term Insurance", score: "₹0 / 12× Pay", pts: "0/10", status: "critical" },
                    { name: "Investment Rate", score: "12% / 20%", pts: "10/15", status: "warning" },
                    { name: "SIP Step-Up", score: "+10% / +10%", pts: "10/10", status: "excellent" },
                    { name: "3-Account System", score: "Setup ✓", pts: "10/10", status: "excellent" },
                    { name: "50-30-20 Budget", score: "54% needs", pts: "5/10", status: "warning" },
                    { name: "Credit Utilization", score: "18% usage", pts: "10/10", status: "excellent" },
                    { name: "Gold Allocation", score: "4% networth", pts: "5/5", status: "excellent" },
                  ].map((rule) => {
                    const dot =
                      rule.status === "excellent"
                        ? "bg-green-500"
                        : rule.status === "warning"
                          ? "bg-amber-500"
                          : "bg-red-500";
                    const pts = rule.pts.split("/");
                    const pct = pts[0] && pts[1] ? (parseInt(pts[0]) / parseInt(pts[1])) * 100 : 0;
                    return (
                      <div key={rule.name} className="rounded-lg border border-border/70 bg-background/50 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-foreground leading-snug">{rule.name}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{rule.score}</div>
                          </div>
                          <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
                        </div>
                        <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              rule.status === "excellent" ? "bg-green-500" : rule.status === "warning" ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          {rule.pts} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The 9 Rules ────────────────────────────────────────────────────── */}
      <section id="rules" className="py-20 border-t border-border/40 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <SectionBadge>The Framework</SectionBadge>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">The 9-Rule Engine</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Every rule is backed by standard financial planning principles. Four pillars, nine rules, one score.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <RulePillar
              icon={<Wallet className="h-4 w-4" />}
              pillar="Foundation"
              color="indigo"
              rules={[
                { name: "Emergency Fund", rule: "6 Months Expenses", pts: 20, desc: "Liquid cushion covering 6 months of living expenses." },
              ]}
            />
            <RulePillar
              icon={<Shield className="h-4 w-4" />}
              pillar="Protection"
              color="blue"
              rules={[
                { name: "Health Insurance", rule: "₹10L+ Cover", pts: 10, desc: "Prevents medical bills from draining your savings." },
                { name: "Term Insurance", rule: "10–12× Income", pts: 10, desc: "Safeguards your dependents in worst-case scenarios." },
              ]}
            />
            <RulePillar
              icon={<TrendingUp className="h-4 w-4" />}
              pillar="Accumulation"
              color="violet"
              rules={[
                { name: "Investment Rate", rule: "≥20% of Income", pts: 15, desc: "Proportion of income routed to automated savings/SIPs." },
                { name: "SIP Step-Up", rule: "≥10% Annually", pts: 10, desc: "Ensures savings grow as your income grows." },
                { name: "Gold Allocation", rule: "≤10% Portfolio", pts: 5, desc: "Balanced hedge via conservative asset allocation." },
              ]}
            />
            <RulePillar
              icon={<CheckCircle className="h-4 w-4" />}
              pillar="Process"
              color="purple"
              rules={[
                { name: "50-30-20 Budget", rule: "Target Split", pts: 10, desc: "Needs ≤50%, Wants ≤30%, Savings ≥20%." },
                { name: "3-Account System", rule: "Process Setup", pts: 10, desc: "Spending, Savings, and Investment accounts separated." },
                { name: "Credit Discipline", rule: "≤30% Utilization", pts: 10, desc: "Avoids toxic debt cycles and preserves credit health." },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── Testimonial strip / social proof ───────────────────────────────── */}
      <section className="border-t border-border/40 bg-muted/20 py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="flex justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <blockquote className="text-lg md:text-xl font-semibold leading-relaxed text-foreground max-w-2xl mx-auto">
            "I finally understand <em>why</em> my finances feel uncertain despite a good income.
            WealthOS showed me that my emergency fund was the real gap — now I'm actually fixing it."
          </blockquote>
          <cite className="mt-4 block text-xs text-muted-foreground not-italic">
            — Software Engineer, Bengaluru (Personal scorecard, 2024)
          </cite>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <SectionBadge>Common Questions</SectionBadge>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">FAQ</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is this really free?",
                a: "Yes, completely. WealthOS is a free tool. There's nothing to pay for, sign up for, or subscribe to.",
              },
              {
                q: "Does it connect to my bank?",
                a: "No. WealthOS never connects to your bank. You manually enter approximate numbers (like monthly income and expenses) — estimates are fine.",
              },
              {
                q: "Where is my data stored?",
                a: "Entirely in your browser's localStorage — on your own device. It never leaves your computer. Clearing browser data will erase it.",
              },
              {
                q: "How often should I use it?",
                a: "Once a month. After your salary hits, update 3–5 numbers, check the score, act on the top recommendation, then close it until next month.",
              },
              {
                q: "What if I'm not Indian?",
                a: "The rules and scoring logic are universal. Only the currency displays in ₹ by default — the discipline principles apply regardless of country.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border bg-card overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-foreground list-none">
                  {faq.q}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <div className="border-t border-border/50 px-5 py-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/40 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-20 dark:opacity-10 rounded-full"
            style={{ background: "radial-gradient(ellipse, #818cf8 0%, transparent 70%)", filter: "blur(80px)" }}
          />
        </div>

        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold mb-6 border"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.12) 100%)",
              borderColor: "rgba(99,102,241,0.3)",
              color: "#818cf8",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Takes 5 minutes
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Ready to see your
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #ec4899 100%)" }}
            >
              discipline score?
            </span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Enter your estimates once. See exactly where you stand and what to fix first.
            Completely free, completely private.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
            >
              Build My Scorecard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free forever · No account · No bank link
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="grid h-6 w-6 place-items-center rounded text-white font-black text-xs"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
            >
              W
            </div>
            <span className="text-xs font-semibold">WealthOS</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} WealthOS. All data stored locally on your device. Made with ♥ for financial discipline.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link to="/onboarding" className="hover:text-foreground transition-colors">Setup</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
      style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
    >
      {children}
    </span>
  );
}

function HeroScoreCard({
  score,
  label,
  color,
  gradStart,
  gradEnd,
  description,
  featured,
}: {
  score: number;
  label: string;
  color: string;
  gradStart: string;
  gradEnd: string;
  description: string;
  featured?: boolean;
}) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className={`rounded-2xl border p-6 text-center transition-all ${
        featured
          ? "border-amber-300/40 dark:border-amber-700/40 shadow-xl scale-105"
          : "border-border"
      } bg-card`}
      style={featured ? { boxShadow: `0 20px 50px -12px ${color}40` } : undefined}
    >
      <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
        <svg className="absolute h-full w-full -rotate-90">
          <circle cx="48" cy="48" r="36" className="stroke-muted/50" strokeWidth="6" fill="none" />
          <circle
            cx="48" cy="48" r="36"
            stroke={color}
            strokeWidth="7" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-extrabold tabular-nums" style={{ color }}>
            {score}
          </span>
          <span className="text-[9px] text-muted-foreground font-medium">/ 100</span>
        </div>
      </div>
      <div
        className="mt-3 text-xs font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 inline-block"
        style={{ background: `${color}18`, color }}
      >
        {label}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
  highlight,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${highlight ? "border-indigo-300/40 dark:border-indigo-700/40" : "border-border"} bg-card relative overflow-hidden`}
      style={highlight ? { boxShadow: "0 10px 40px -10px rgba(99,102,241,0.3)" } : undefined}
    >
      {highlight && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, #6366f1, #a78bfa)" }}
        />
      )}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
        >
          {icon}
        </div>
        <span
          className="text-4xl font-black leading-none opacity-10 select-none"
          style={{ color: "#6366f1" }}
        >
          {step}
        </span>
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function PhilosophyCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-sm">{title}</h3>
      <p
        className="mt-2 text-xs leading-relaxed text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
}

function RulePillar({
  icon,
  pillar,
  color,
  rules,
}: {
  icon: React.ReactNode;
  pillar: string;
  color: string;
  rules: { name: string; rule: string; pts: number; desc: string }[];
}) {
  const colorMap: Record<string, string> = {
    indigo: "#6366f1",
    blue: "#3b82f6",
    violet: "#7c3aed",
    purple: "#9333ea",
  };
  const c = colorMap[color] ?? "#6366f1";

  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1.5 w-fit"
        style={{ background: `${c}18`, color: c }}
      >
        {icon} {pillar}
      </div>
      <div className="space-y-2.5">
        {rules.map((r) => (
          <div key={r.name} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-bold">{r.name}</div>
                <div className="text-[10px] font-semibold mt-0.5" style={{ color: c }}>{r.rule}</div>
              </div>
              <span
                className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${c}15`, color: c }}
              >
                {r.pts} pts
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
