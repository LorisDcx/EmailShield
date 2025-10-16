import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription, usage-based metering and Stripe invoices.
        </p>
      </div>

      <Card className="border-border/40 bg-background/80">
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            You are on the Free tier with 1,000 checks per month.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button>Upgrade plan</Button>
          <Button variant="outline">Open customer portal</Button>
          <Badge variant="secondary">Stripe connected</Badge>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-background/80">
        <CardHeader>
          <CardTitle>Upcoming invoice</CardTitle>
          <CardDescription>
            Metered usage reconciles nightly. Overages billed at month end.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground uppercase">
              Estimated charges
            </p>
            <p className="text-2xl font-semibold">€29.00</p>
            <p className="text-xs text-muted-foreground">
              Includes {Intl.NumberFormat().format(18_650)} metered checks.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground uppercase">
              Billing period
            </p>
            <p className="text-2xl font-semibold">Oct 1 → Oct 31</p>
            <p className="text-xs text-muted-foreground">
              Charges will settle via Stripe at period close.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-background/80">
        <CardHeader>
          <CardTitle>Integration checklist</CardTitle>
          <CardDescription>
            Netlify functions trigger Stripe Checkout and Portal flows using the
            secret keys below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <code>billing-checkout</code> Netlify Function → Stripe Checkout
            session (starter or pro plan).
          </p>
          <p>
            • <code>billing-portal</code> Netlify Function → customer portal for
            payment methods and invoices.
          </p>
          <p>
            • Webhooks can target Railway API for resilient background
            processing (<code>/webhooks/stripe</code>).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
