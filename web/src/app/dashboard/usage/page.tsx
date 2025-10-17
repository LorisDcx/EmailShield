import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { buildApiUrl } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { Badge } from "@/components/ui/badge";

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

async function fetchUsage(token: string): Promise<UsageResponse> {
  const response = await fetch(buildApiUrl("/api/admin-usage"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch usage: ${response.status}`);
  }

  return response.json() as Promise<UsageResponse>;
}

export default async function UsagePage() {
  const { getToken } = auth();
  const token =
    (await getToken({ template: "netlify" })) ?? (await getToken());

  if (!token) {
    redirect("/sign-in");
  }

  const usage = await fetchUsage(token);

  const totalChecks =
    usage.totals.ok + usage.totals.suspect + usage.totals.disposable;
  const disposableRatio =
    totalChecks === 0
      ? 0
      : Math.round((usage.totals.disposable / totalChecks) * 100);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Usage</h1>
        <p className="text-muted-foreground">
          Track daily consumption to optimise cache strategy and quotas.
        </p>
      </div>

      <Card className="border-border/40 bg-background/80">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Daily verdict breakdown
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Sum of checks grouped by verdict in the past 30 days.
            </p>
          </div>
          <Badge variant="secondary">
            {totalChecks.toLocaleString()} total checks
          </Badge>
        </CardHeader>
        <CardContent>
          <UsageChart data={usage.series} />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground uppercase">
                OK verdicts
              </p>
              <p className="text-2xl font-semibold">
                {usage.totals.ok.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground uppercase">
                Suspect
              </p>
              <p className="text-2xl font-semibold">
                {usage.totals.suspect.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground uppercase">
                Disposable
              </p>
              <p className="text-2xl font-semibold">
                {usage.totals.disposable.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {disposableRatio}% of checks blocked
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



