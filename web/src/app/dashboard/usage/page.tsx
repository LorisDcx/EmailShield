import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { Badge } from "@/components/ui/badge";

const usageData = [
  { date: "Oct 11", ok: 820, suspect: 130, disposable: 190 },
  { date: "Oct 12", ok: 901, suspect: 144, disposable: 211 },
  { date: "Oct 13", ok: 980, suspect: 152, disposable: 198 },
  { date: "Oct 14", ok: 1120, suspect: 176, disposable: 242 },
  { date: "Oct 15", ok: 1255, suspect: 190, disposable: 268 },
  { date: "Oct 16", ok: 1311, suspect: 204, disposable: 286 },
];

export default function UsagePage() {
  const total = usageData.reduce(
    (acc, item) => {
      acc.ok += item.ok;
      acc.suspect += item.suspect;
      acc.disposable += item.disposable;
      return acc;
    },
    { ok: 0, suspect: 0, disposable: 0 }
  );

  const totalChecks = total.ok + total.suspect + total.disposable;
  const disposableRatio = Math.round((total.disposable / totalChecks) * 100);

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
              Sum of checks grouped by verdict in the past 7 days.
            </p>
          </div>
          <Badge variant="secondary">
            {totalChecks.toLocaleString()} total checks
          </Badge>
        </CardHeader>
        <CardContent>
          <UsageChart data={usageData} />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground uppercase">
                OK verdicts
              </p>
              <p className="text-2xl font-semibold">
                {total.ok.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground uppercase">
                Suspect
              </p>
              <p className="text-2xl font-semibold">
                {total.suspect.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground uppercase">
                Disposable
              </p>
              <p className="text-2xl font-semibold">
                {total.disposable.toLocaleString()}
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
