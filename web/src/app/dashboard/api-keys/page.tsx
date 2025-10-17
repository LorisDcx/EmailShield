"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { buildApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ApiKey {
  id: string;
  label: string | null;
  last4: string;
  createdAt: string;
  revokedAt: string | null;
}

interface ApiKeyListResponse {
  keys: ApiKey[];
}

interface ApiKeyCreateResponse extends ApiKey {
  secret: string;
  ownerId: string;
}

async function fetchJson<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}): ${text}`);
  }

  return response.json() as Promise<T>;
}

export default function ApiKeysPage() {
  const { getToken } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [recentSecret, setRecentSecret] = useState<{ label: string | null; secret: string } | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token =
        (await getToken({ template: "netlify" })) ?? (await getToken());
      if (!token) {
        throw new Error("missing_session_token");
      }
      const data = await fetchJson<ApiKeyListResponse>("/api/admin-keys-list", token);
      setKeys(data.keys);
    } catch (err) {
      console.error(err);
      setError("Unable to load API keys");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void fetchKeys();
  }, [fetchKeys]);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    setError(null);
    try {
      const token =
        (await getToken({ template: "netlify" })) ?? (await getToken());
      if (!token) {
        throw new Error("missing_session_token");
      }
      const payload = await fetchJson<ApiKeyCreateResponse>(
        "/api/admin-keys-create",
        token,
        {
          method: "POST",
          body: JSON.stringify({ label: label || null }),
        }
      );

      setRecentSecret({ label: payload.label, secret: payload.secret });
      setLabel("");
      setKeys((prev) => [payload, ...prev]);
    } catch (err) {
      console.error(err);
      setError("Failed to create API key");
    } finally {
      setCreating(false);
    }
  }, [getToken, label]);

  const handleRevoke = useCallback(
    async (keyId: string) => {
      setRevoking(keyId);
      setError(null);
      try {
        const token =
          (await getToken({ template: "netlify" })) ?? (await getToken());
        if (!token) {
          throw new Error("missing_session_token");
        }
        await fetchJson<ApiKey>(
          "/api/admin-keys-revoke",
          token,
          {
            method: "POST",
            body: JSON.stringify({ keyId }),
          }
        );
        setKeys((prev) =>
          prev.map((key) =>
            key.id === keyId ? { ...key, revokedAt: new Date().toISOString() } : key
          )
        );
      } catch (err) {
        console.error(err);
        setError("Failed to revoke API key");
      } finally {
        setRevoking(null);
      }
    },
    [getToken]
  );

  const activeKeys = useMemo(
    () => keys.filter((key) => !key.revokedAt),
    [keys]
  );

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
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Label (optional)"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              aria-label="API key label"
            />
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Generate new key"}
            </Button>
          </div>
          {recentSecret && (
            <div className="rounded-md border border-border/40 bg-muted/40 p-4 text-sm">
              <p className="font-semibold">New key created</p>
              <p className="text-muted-foreground">
                Copy this secret now — it will not be shown again.
              </p>
              <code className="mt-2 block break-all rounded bg-background/80 p-2">
                {recentSecret.secret}
              </code>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Generation calls the Netlify function {" "}
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
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {loading && <p className="text-sm text-muted-foreground">Loading keys...</p>}
          {!loading && keys.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No API keys yet. Create one to start integrating MailShield.
            </p>
          )}
          {keys.map((key, index) => (
            <div key={key.id} className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    {key.label ?? "Untitled key"}{" "}
                    <span className="text-xs text-muted-foreground">
                      (••••••{key.last4})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(key.createdAt).toLocaleString()} ·
                    {" "}
                    {key.revokedAt
                      ? `Revoked ${new Date(key.revokedAt).toLocaleString()}`
                      : "Active"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs uppercase tracking-wide text-muted-foreground"
                    aria-live="polite"
                  >
                    {key.revokedAt ? "revoked" : "active"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRevoke(key.id)}
                    disabled={!!key.revokedAt || revoking === key.id}
                  >
                    {revoking === key.id ? "Revoking..." : "Revoke"}
                  </Button>
                </div>
              </div>
              {index < keys.length - 1 && <Separator />}
            </div>
          ))}
          {!loading && activeKeys.length === 0 && keys.length > 0 && (
            <p className="text-xs text-muted-foreground">
              All keys are revoked. Generate a new one to continue using the API.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


