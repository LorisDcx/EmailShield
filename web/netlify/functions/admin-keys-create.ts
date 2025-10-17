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
  const ownerId = session.userId;

  // TODO: Persist the new API key (hash) in PostgreSQL for ownerId.
  // Placeholder response mimics newly created key and hashed storage.
  return {
    statusCode: 200,
    body: JSON.stringify({
      id: "key_new",
      ownerId,
      secret: "sk_live_example_return_once",
      prefix: "sk_live_example",
      createdAt: new Date().toISOString(),
    }),
  };
};
