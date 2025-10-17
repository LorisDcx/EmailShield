import type { Handler } from "@netlify/functions";
import { requireAuth } from "./_clerk";
import { getDbPool } from "../../src/lib/db";

type RevokedKeyRow = {
  id: string;
  label: string | null;
  last4: string;
  created_at: string;
  revoked_at: string | null;
};

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
  const pool = getDbPool();

  let keyId: string | undefined;
  try {
    const payload = JSON.parse(event.body ?? "{}");
    if (typeof payload?.keyId === "string" && payload.keyId.trim()) {
      keyId = payload.keyId.trim();
    }
  } catch (error) {
    console.error("Failed to parse revoke body", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "invalid_json_body" }),
    };
  }

  if (!keyId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "keyId is required" }),
    };
  }

  try {
    const { rows } = await pool.query<RevokedKeyRow>(
      `
      UPDATE api_keys
      SET revoked_at = COALESCE(revoked_at, NOW())
      WHERE id = $1 AND owner_id = $2
      RETURNING id, label, last4, created_at, revoked_at
      `,
      [keyId, ownerId]
    );

    const revoked = rows[0];
    if (!revoked) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "api_key_not_found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: revoked.id,
        label: revoked.label,
        ownerId,
        last4: revoked.last4,
        createdAt: revoked.created_at,
        revokedAt: revoked.revoked_at,
      }),
    };
  } catch (error) {
    console.error("Failed to revoke API key", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "failed_to_revoke_api_key" }),
    };
  }
};
