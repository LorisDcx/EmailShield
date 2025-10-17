import type { Handler } from "@netlify/functions";
import { requireAuth } from "./_clerk";
import { getDbPool } from "../../src/lib/db";

type UsageRow = {
  date: string;
  ok: number;
  suspect: number;
  disposable: number;
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
    const { rows } = await pool.query<UsageRow>(
      `
      SELECT date, ok, suspect, disposable
      FROM usage_daily
      WHERE owner_id = $1
      ORDER BY date DESC
      LIMIT 30
      `,
      [ownerId]
    );

    const totals = rows.reduce(
      (acc, row) => {
        acc.ok += Number(row.ok);
        acc.suspect += Number(row.suspect);
        acc.disposable += Number(row.disposable);
        return acc;
      },
      { ok: 0, suspect: 0, disposable: 0 }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        ownerId,
        totals,
        series: rows
          .map((row) => ({
            date: row.date,
            ok: Number(row.ok),
            suspect: Number(row.suspect),
            disposable: Number(row.disposable),
          }))
          .reverse(),
      }),
    };
  } catch (error) {
    console.error("Failed to fetch usage", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "failed_to_fetch_usage" }),
    };
  }
};
