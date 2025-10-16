import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "MailShield Quickstart",
  description: "Integrate MailShield in minutes with curl, Node, or Python.",
};

const steps = [
  {
    title: "1. Get your API key",
    body: "Create a MailShield account, then generate a key from Dashboard → API Keys.",
  },
  {
    title: "2. Make your first request",
    body: "Use the REST endpoint /v1/check-email to classify addresses in realtime.",
  },
  {
    title: "3. Cache wisely",
    body: "Follow the ttl_seconds recommendation to avoid unnecessary calls.",
  },
];

export default function QuickstartPage() {
  return (
    <div className="container py-12">
      <div className="space-y-4 text-center">
        <Badge variant="secondary" id="sdks">
          Quickstart
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight">
          Integrate MailShield in minutes.
        </h1>
        <p className="text-muted-foreground">
          Drop-in snippets for curl, Node.js, Python and bulk ingestion.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6">
        <Card className="border-border/40 bg-background/80">
          <CardHeader>
            <CardTitle>Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            {steps.map((step, index) => (
              <div key={step.title} className="space-y-2">
                <h2 className="text-lg font-semibold">
                  {step.title}
                  <span className="ml-2 text-xs font-medium uppercase text-primary/80">
                    Step {index + 1}
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground">{step.body}</p>
                {index < steps.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-background/80">
          <CardHeader>
            <CardTitle>curl</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted/60 p-4 text-sm">
              <code>
                {`curl -X POST https://api.mailshield.dev/v1/check-email \\
  -H "Authorization: Bearer sk_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com"}'`}
              </code>
            </pre>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-background/80">
          <CardHeader>
            <CardTitle>Node SDK</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted/60 p-4 text-sm">
              <code>
                {`import { EmailShieldClient } from "@mailshield/node";

const client = new EmailShieldClient({ apiKey: process.env.MAILSHIELD_KEY! });

const verdict = await client.checkEmail("user@example.com");

if (verdict.classification === "disposable") {
  throw new Error("Please provide a permanent email address.");
}`}
              </code>
            </pre>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-background/80">
          <CardHeader>
            <CardTitle>Python SDK</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted/60 p-4 text-sm">
              <code>
                {`from emailshield import EmailShieldClient

client = EmailShieldClient(api_key=os.getenv("MAILSHIELD_KEY"))
verdict = client.check_email("user@example.com")

if verdict.classification == "suspect":
    trigger_soft_challenge(verdict)`}
              </code>
            </pre>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-background/80">
          <CardHeader>
            <CardTitle>Bulk endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted/60 p-4 text-sm">
              <code>
                {`POST /v1/check-bulk (max 100 emails/request)
{
  "emails": [
    {"email": "user@example.com"},
    {"email": "throwaway@mailinator.com"}
  ]
}`}
              </code>
            </pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Response includes per-verdict counts so you can monitor disposable
              ratios across campaigns.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
