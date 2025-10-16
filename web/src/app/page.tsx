import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Gauge, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const features = [
  {
    title: "Latency-first architecture",
    description:
      "FastAPI, Redis caching and local DNS resolvers deliver verdicts in under 200ms across the EU region.",
    icon: Zap,
  },
  {
    title: "Actionable scoring",
    description:
      "Every email receives a score from 0 to 1 with granular reasons so you can route soft vs hard blocks confidently.",
    icon: Gauge,
  },
  {
    title: "Developer-first tooling",
    description:
      "SDKs for Node & Python, bulk endpoints, Postman collection and copy-paste snippets help you ship integrations fast.",
    icon: Code,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="container flex flex-col gap-10 py-20 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="max-w-xl space-y-6">
              <Badge className="w-fit items-center gap-2 text-xs uppercase tracking-wide">
                <ShieldCheck className="h-3.5 w-3.5" />
                Real-time disposable email intelligence
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                Block disposable emails without slowing onboarding.
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                MailShield inspects every signup in milliseconds so you can stop
                burner accounts, tune soft validation flows and keep acquisition
                costs in check.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/sign-up">
                    Create free account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/docs/quickstart">View quickstart</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Free tier includes 1,000 checks - EU region - p95 &lt; 200ms
              </p>
            </div>
            <Card className="mx-auto w-full max-w-md border-border/40 bg-background/60 backdrop-blur">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-1 text-left">
                  <p className="text-sm text-muted-foreground">Latest verdict</p>
                  <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/40 p-4">
                    <div>
                      <p className="text-sm font-medium">
                        throwaway@mailinator.com
                      </p>
                      <p className="text-xs text-muted-foreground">
                        disposable - score 1.0 - domain_blocklist
                      </p>
                    </div>
                    <Badge variant="destructive">blocked</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left text-xs text-muted-foreground">
                  <div>
                    <p className="text-sm font-semibold text-foreground">80%</p>
                    cache hit rate
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      &lt;200ms
                    </p>
                    p95 EU latency
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">1%</p>
                    target FPR
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      24h
                    </p>
                    suggested TTL
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container py-16 md:py-20">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <Badge variant="secondary" className="mx-auto w-fit">
              Built for product-led teams
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Everything you need to protect your signup funnel.
            </h2>
            <p className="text-muted-foreground">
              MailShield combines blocklists, MX heuristics, DNS intelligence
              and scoring to stop temporary inboxes without frustrating real
              customers.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border border-border/40 bg-background/60 backdrop-blur"
              >
                <CardContent className="space-y-3 p-6 text-left">
                  <feature.icon className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border/40 bg-muted/30 py-16 md:py-20">
          <div className="container grid gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-4 text-left">
              <Badge variant="secondary">SDKs & snippets</Badge>
              <h2 className="text-3xl font-semibold tracking-tight">
                Drop-in integrations for your stack.
              </h2>
              <p className="text-muted-foreground">
                Guard signup forms, landing pages and marketing funnels with the
                same API. Use the realtime endpoint for single checks or batch
                clean lists with /v1/check-bulk.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/dashboard/api-keys">
                    Manage API keys
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/docs/quickstart#sdks">See SDK examples</Link>
                </Button>
              </div>
            </div>
            <Card className="border border-border/40 bg-background/80 shadow-lg">
              <CardContent className="space-y-4 p-6 text-left">
                <pre className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
                  <code>
                    {`curl -X POST https://api.mailshield.dev/v1/check-email \\
  -H "Authorization: Bearer sk_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com"}'`}
                  </code>
                </pre>
                <p className="text-xs text-muted-foreground">
                  Use the returned ttl_seconds to cache verdicts client-side and
                  stay under quota.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
