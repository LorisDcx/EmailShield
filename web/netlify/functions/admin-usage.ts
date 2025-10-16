import type { Handler } from "@netlify/functions";

export const handler: Handler = async () => {
  // TODO: query usage_daily table filtered by account id and date range.
  return {
    statusCode: 200,
    body: JSON.stringify({
      totals: {
        ok: 6120,
        suspect: 912,
        disposable: 1348,
      },
      series: [
        { date: "2025-10-11", ok: 820, suspect: 130, disposable: 190 },
        { date: "2025-10-12", ok: 901, suspect: 144, disposable: 211 },
        { date: "2025-10-13", ok: 980, suspect: 152, disposable: 198 },
        { date: "2025-10-14", ok: 1120, suspect: 176, disposable: 242 },
        { date: "2025-10-15", ok: 1255, suspect: 190, disposable: 268 },
        { date: "2025-10-16", ok: 1311, suspect: 204, disposable: 286 },
      ],
    }),
  };
};
