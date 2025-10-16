import type { Handler } from "@netlify/functions";

export const handler: Handler = async () => {
  // TODO: hydrate with real account data (plan, usage, owner email) from PostgreSQL.
  return {
    statusCode: 200,
    body: JSON.stringify({
      accountId: "acct_123",
      email: "founder@mailshield.dev",
      plan: "free",
      usage: {
        monthly: 18650,
        quota: 25000,
      },
    }),
  };
};
