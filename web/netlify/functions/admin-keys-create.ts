import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // TODO: Verify Clerk session via webhook JWT and write to PostgreSQL.
  // Placeholder response mimics newly created key and hashed storage.
  return {
    statusCode: 200,
    body: JSON.stringify({
      id: "key_new",
      secret: "sk_live_example_return_once",
      prefix: "sk_live_example",
      createdAt: new Date().toISOString(),
    }),
  };
};
