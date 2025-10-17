import type { Handler } from "@netlify/functions";
import { requireAuth } from "./_clerk";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const authResult = await requireAuth(event);
  if ("error" in authResult) {
    return authResult.error;
  }

  const { session } = authResult;

  // TODO: Create Stripe billing portal session tied to the authenticated account (session.userId).
  return {
    statusCode: 200,
    body: JSON.stringify({
      portalUrl: "https://billing.stripe.com/session/test-portal",
      ownerId: session.userId,
    }),
  };
};
