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

  const body = JSON.parse(event.body ?? "{}");
  const priceId = body.priceId ?? process.env.STRIPE_PRICE_STARTER;

  if (!priceId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing Stripe price configuration" }),
    };
  }

  // TODO: Call Stripe checkout.session.create with Clerk customer reference (session.userId).
  return {
    statusCode: 200,
    body: JSON.stringify({
      checkoutUrl: "https://checkout.stripe.com/pay/test-session",
      priceId,
      ownerId: session.userId,
    }),
  };
};
