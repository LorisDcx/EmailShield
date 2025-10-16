import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const body = JSON.parse(event.body ?? "{}");
  const priceId = body.priceId ?? process.env.STRIPE_PRICE_STARTER;

  if (!priceId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing Stripe price configuration" }),
    };
  }

  // TODO: Call Stripe checkout.session.create with Clerk customer reference.
  return {
    statusCode: 200,
    body: JSON.stringify({
      checkoutUrl: "https://checkout.stripe.com/pay/test-session",
      priceId,
    }),
  };
};
