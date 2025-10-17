import type { Handler } from "@netlify/functions";
import { requireAuth } from "./_clerk";
import { getDbPool } from "../../src/lib/db";

type ApiKeyRow = {
  id: string;
  label: string | null;
  last4: string;
  created_at: string;
  revoked_at: string | null;
};

export const handler: Handler = async (event) => {
  const authResult = await requireAuth(event);
  if ("error" in authResult) {
    return authResult.error;
  }

  const { session } = authResult;
  const ownerId = session.userId;
  const pool = getDbPool();

  try {
    const { rows } = await pool.query<ApiKeyRow>(
      `
      SELECT id, label, last4, created_at, revoked_at
      FROM api_keys
      WHERE owner_id = $1
      ORDER BY created_at DESC
      `,
      [ownerId]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        ownerId,
        keys: rows.map((row) => ({
          id: row.id,
          label: row.label,
          last4: row.last4,
          createdAt: row.created_at,
          revokedAt: row.revoked_at,
        })),
      }),
    };
  } catch (error) {
    console.error("Failed to list API keys", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "failed_to_list_api_keys" }),
    };
  }
};
