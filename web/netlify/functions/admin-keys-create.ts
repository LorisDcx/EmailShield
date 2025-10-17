import type { Handler } from "@netlify/functions";
import { randomBytes, createHash } from "crypto";
import { requireAuth } from "./_clerk";
import { getDbPool } from "../../src/lib/db";

type InsertedKeyRow = {
  id: string;
  label: string | null;
  created_at: string;
  last4: string;
};

function buildSecret(): { secret: string; hash: string; last4: string } {
  const secret = `sk_${randomBytes(32).toString("hex")}`;
  const hash = createHash("sha256").update(secret).digest("hex");
  const last4 = secret.slice(-6).toUpperCase();
  return { secret, hash, last4 };
}

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

  let label: string | null = null;
  try {
    const payload = JSON.parse(event.body ?? "{}");
    if (typeof payload?.label === "string" && payload.label.trim().length > 0) {
      label = payload.label.trim();
    }
  } catch (error) {
    console.error("Failed to parse request body", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "invalid_json_body" }),
    };
  }

  const { secret, hash, last4 } = buildSecret();

  try {
    const { rows } = await pool.query<InsertedKeyRow>(
      `
      INSERT INTO api_keys (owner_id, label, hashed_secret, last4)
      VALUES ($1, $2, $3, $4)
      RETURNING id, label, created_at, last4
      `,
      [ownerId, label, hash, last4]
    );

    const inserted = rows[0];
    if (!inserted) {
      throw new Error("insert_failed");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: inserted.id,
        label: inserted.label,
        ownerId,
        secret,
        last4: inserted.last4,
        createdAt: inserted.created_at,
      }),
    };
  } catch (error) {
    console.error("Failed to create API key", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "failed_to_create_api_key" }),
    };
  }
};
