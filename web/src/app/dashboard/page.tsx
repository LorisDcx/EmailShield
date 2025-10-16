import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const summaryStats = [
  { label: "Checks today", value: "1,420", helper: "+12% vs yesterday" },
  { label: "Disposable blocked", value: "312", helper: "21.9% of total" },
  { label: "Suspect challenged", value: "104", helper: "Soft mode enabled" },
  { label: "Cache hit rate", value: "83%", helper: "MX cached in Redis" },
];

const recentVerdicts = [
  {
    email: "alpha@mailinator.com",
    classification: "disposable",
    score: 1.0,
    timestamp: "2m ago",
    reasons: ["domain_blocklist", "keyword_match"],
  },
  {
    email: "growth@startup.io",
    classification: "ok",
    score: 0.08,
    timestamp: "5m ago",
    reasons: ["mx_ok"],
  },
  {
    email: "promo@tempbox.xyz",
    classification: "suspect",
    score: 0.62,
    timestamp: "8m ago",
    reasons: ["keyword_match"],
  },
  {
    email: "support@agency.co",
    classification: "ok",
    score: 0.12,
    timestamp: "11m ago",
    reasons: ["mx_ok"],
  },
];

export default function DashboardHome() {
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
            Recent verdicts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentVerdicts.map((item, index) => (
            <div key={item.email} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{item.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.reasons.join(" · ")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      item.classification === "disposable"
                        ? "destructive"
                        : item.classification === "suspect"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {item.classification}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    score {item.score.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.timestamp}</span>
                <span>ttl 24h</span>
              </div>
              {index < recentVerdicts.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
