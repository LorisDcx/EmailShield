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
  const { keyId } = JSON.parse(event.body ?? "{}");

  if (!keyId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "keyId is required" }),
    };
  }

  // TODO: apply database update to mark API key as revoked for session.userId.
  return {
    statusCode: 200,
    body: JSON.stringify({
      id: keyId,
      ownerId: session.userId,
      status: "revoked",
      revokedAt: new Date().toISOString(),
    }),
  };
};
