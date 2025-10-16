import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ApiKey = {
  id: string;
  label: string;
  lastUsedAt: string | null;
  createdAt: string;
  prefix: string;
  status: "active" | "revoked";
};

async function getApiKeys(): Promise<ApiKey[]> {
  // TODO: replace with call to Netlify function admin-keys-list when backend is ready.
  return [
    {
      id: "key_1",
      label: "Production API",
      lastUsedAt: "2025-10-16T12:32:00.000Z",
      createdAt: "2025-08-01T08:12:00.000Z",
      prefix: "sk_live_XYZ123",
      status: "active",
    },
    {
      id: "key_2",
      label: "Staging API",
      lastUsedAt: null,
      createdAt: "2025-09-15T10:45:00.000Z",
      prefix: "sk_test_ABC456",
      status: "revoked",
    },
  ];
}

export default async function ApiKeysPage() {
  const apiKeys = await getApiKeys();

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">API keys</h1>
        <p className="text-muted-foreground">
          Generate and manage MailShield API keys for your environments.
        </p>
      </div>

      <Card className="border-border/40 bg-background/80">
        <CardHeader>
          <CardTitle>Create API key</CardTitle>
          <CardDescription>
            Keys are shown once on creation. Store them securely and rotate
            regularly.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button>Generate new key</Button>
          <Button variant="outline">Revoke selected</Button>
          <p className="text-xs text-muted-foreground">
            Generation calls the Netlify function{" "}
            <code className="rounded bg-muted px-1">admin-keys-create</code>.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-background/80">
        <CardHeader>
          <CardTitle>Existing keys</CardTitle>
          <CardDescription>
            Only the final 6 characters are visible for security reasons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKeys.map((key, index) => (
            <div key={key.id} className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    {key.label}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({key.prefix.slice(-6)})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(key.createdAt).toLocaleDateString()} · Last
                    used{" "}
                    {key.lastUsedAt
                      ? new Date(key.lastUsedAt).toLocaleString()
                      : "never"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs uppercase tracking-wide text-muted-foreground"
                    aria-live="polite"
                  >
                    {key.status}
                  </span>
                  <Button size="sm" variant="ghost">
                    Reveal once
                  </Button>
                  <Button size="sm" variant="outline">
                    Revoke
                  </Button>
                </div>
              </div>
              {index < apiKeys.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
