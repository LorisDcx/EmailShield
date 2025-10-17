import { createClerkClient } from "@clerk/backend";
import type { HandlerEvent, HandlerResponse } from "@netlify/functions";

const clerk = createClerkClient({
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});

type AuthSuccess = {
  session: Awaited<ReturnType<typeof clerk.sessions.getSession>>;
};

type AuthError = {
  error: HandlerResponse;
};

export async function requireAuth(event: HandlerEvent): Promise<AuthSuccess | AuthError> {
  if (!clerk) {
    return {
      error: {
        statusCode: 500,
        body: JSON.stringify({ error: "Clerk client not configured" }),
      },
    };
  }

  const authorization = event.headers.authorization || event.headers.Authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return {
      error: {
        statusCode: 401,
        body: JSON.stringify({ error: "missing authorization header" }),
      },
    };
  }

  const token = authorization.slice("Bearer ".length).trim();

  try {
    const session = await clerk.sessions.getSession(token);

    if (!session) {
      throw new Error("session not found");
    }

    return { session };
  } catch (error) {
    console.error("Clerk session verification failed", error);
    return {
      error: {
        statusCode: 401,
        body: JSON.stringify({ error: "invalid session" }),
      },
    };
  }
}

