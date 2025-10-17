import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { buildApiUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

type UsageTotals = {
  ok: number;
  suspect: number;
  disposable: number;
};

type UsagePoint = {
  date: string;
  ok: number;
  suspect: number;
  disposable: number;
};

type UsageResponse = {
  totals: UsageTotals;
  series: UsagePoint[];
};

type AccountResponse = {
  accountId: string;
  plan: string;
  quota: number;
  usage: number;
};

async function fetchWithToken<T>(path: string, token: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export default async function DashboardHome() {
  const authState = await auth();
  const token =
    (await authState?.getToken?.({ template: "netlify" })) ??
    authState?.sessionToken ??
    (await authState?.getToken?.());

  if (!token) {
    redirect("/sign-in");
  }

  let account: AccountResponse | null = null;
  let usage: UsageResponse | null = null;

  try {
    [account, usage] = await Promise.all([
      fetchWithToken<AccountResponse>("/api/me", token),
      fetchWithToken<UsageResponse>("/api/admin-usage", token),
    ]);
  } catch (error) {
    console.error("Failed to load dashboard data", error);
  }

  if (!account || !usage) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Real-time insight into your MailShield activity.
          </p>
        </div>
        <Card className="border-border/40 bg-background/80">
          <CardHeader>
            <CardTitle>We’re warming things up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              We couldn’t fetch your usage just yet. This usually means the database
              hasn’t been provisioned or Netlify env vars (`DATABASE_URL`, Clerk keys)
              aren’t set.
            </p>
            <p>
              Double-check your Railway Postgres connection and Netlify settings, then
              refresh the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalChecks =
    usage.totals.ok + usage.totals.suspect + usage.totals.disposable;
  const disposableRatio =
    totalChecks === 0
      ? 0
      : Math.round((usage.totals.disposable / totalChecks) * 100);
  const suspectRatio =
    totalChecks === 0
      ? 0
      : Math.round((usage.totals.suspect / totalChecks) * 100);

  const summaryStats = [
    {
      label: "Checks (30d)",
      value: totalChecks.toLocaleString(),
      helper: `Blocked ${disposableRatio}% disposable`,
    },
    {
      label: "Disposable blocked",
      value: usage.totals.disposable.toLocaleString(),
      helper: `${disposableRatio}% of traffic`,
    },
    {
      label: "Suspect challenged",
      value: usage.totals.suspect.toLocaleString(),
      helper: `${suspectRatio}% flagged soft`,
    },
    {
      label: "Plan",
      value: account.plan.toUpperCase(),
      helper: `${account.usage.toLocaleString()} / ${account.quota.toLocaleString()} checks`,
    },
  ];

  const recentSeries = usage.series.slice(-5).reverse();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Real-time insight into your MailShield activity.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((stat) => (
          <Card key={stat.label} className="border-border/40 bg-background/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/40 bg-background/80">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Recent traffic breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentSeries.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No usage recorded yet. Start sending traffic to see live analytics.
            </p>
          )}
          {recentSeries.map((point, index) => {
            const dayTotal = point.ok + point.suspect + point.disposable;
            const disposablePercent =
              dayTotal === 0
                ? 0
                : Math.round((point.disposable / dayTotal) * 100);
            return (
              <div key={point.date} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">{point.date}</span>
                    <span className="text-xs text-muted-foreground">
                      {point.ok.toLocaleString()} ok · {" "}
                      {point.suspect.toLocaleString()} suspect · {" "}
                      {point.disposable.toLocaleString()} disposable
                    </span>
                  </div>
                  <Badge variant="secondary">{disposablePercent}% disposable</Badge>
                </div>
                {index < recentSeries.length - 1 && <Separator />}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
