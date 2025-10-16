import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { keyId } = JSON.parse(event.body ?? "{}");

  if (!keyId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "keyId is required" }),
    };
  }

  // TODO: apply database update to mark API key as revoked.
  return {
    statusCode: 200,
    body: JSON.stringify({
      id: keyId,
      status: "revoked",
      revokedAt: new Date().toISOString(),
    }),
  };
};
