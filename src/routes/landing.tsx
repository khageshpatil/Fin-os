import { createFileRoute } from "@tanstack/react-router";
import { PublicLanding } from "@/components/dashboard/public-landing";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "WealthOS — Your Personal Financial Discipline OS" },
      {
        name: "description",
        content:
          "WealthOS is a private, local-only financial scorecard that grades your discipline across 9 proven rules. No bank login. No tracking. Just clarity.",
      },
      { name: "og:title", content: "WealthOS — Personal Financial Discipline OS" },
      { name: "og:description", content: "Score your financial discipline across 9 rules. Monthly ritual. 100% private." },
    ],
  }),
  component: PublicLanding,
});
