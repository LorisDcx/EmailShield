import type { Handler } from "@netlify/functions";
import { requireAuth } from "./_clerk";
import { getDbPool } from "../../src/lib/db";

type AccountRow = {
  id: string;
  plan: string | null;
  monthly_quota: number | null;
  quota_used: number | null;
};

const DEFAULT_MONTHLY_QUOTA = 25_000;

export const handler: Handler = async (event) => {
  const authResult = await requireAuth(event);
  if ("error" in authResult) {
    return authResult.error;
  }

  const { session } = authResult;
  const ownerId = session.userId;

  const pool = getDbPool();

  try {
    const { rows } = await pool.query<AccountRow>(
      `
      SELECT id, plan, monthly_quota, quota_used
      FROM accounts
      WHERE clerk_user_id = $1
      LIMIT 1
      `,
      [ownerId]
    );

    let account = rows[0];

    if (!account) {
      const { rows: inserted } = await pool.query<AccountRow>(
        `
        INSERT INTO accounts (clerk_user_id, plan, monthly_quota, quota_used)
        VALUES ($1, 'free', $2, 0)
        RETURNING id, plan, monthly_quota, quota_used
        `,
        [ownerId, DEFAULT_MONTHLY_QUOTA]
      );
      account = inserted[0];
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        accountId: account.id,
        plan: account.plan ?? "free",
        quota: account.monthly_quota ?? DEFAULT_MONTHLY_QUOTA,
        usage: account.quota_used ?? 0,
      }),
    };
  } catch (error) {
    console.error("Failed to load account", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "failed_to_load_account" }),
    };
  }
};
