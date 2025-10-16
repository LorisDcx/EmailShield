import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // TODO: Create Stripe billing portal session tied to the authenticated account.
  return {
    statusCode: 200,
    body: JSON.stringify({
      portalUrl: "https://billing.stripe.com/session/test-portal",
    }),
  };
};
