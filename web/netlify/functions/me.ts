import type { Handler } from "@netlify/functions";
import { requireAuth } from "./_clerk";

export const handler: Handler = async (event) => {
  const authResult = await requireAuth(event);
  if ("error" in authResult) {
    return authResult.error;
  }

  const { session } = authResult;

  // TODO: hydrate with real account data (plan, usage, owner email) from PostgreSQL.
  return {
    statusCode: 200,
    body: JSON.stringify({
      accountId: `acct_${session.userId}`,
      plan: "free",
      usage: {
        monthly: 18650,
        quota: 25000,
      },
      sessionId: session.id,
    }),
  };
};

