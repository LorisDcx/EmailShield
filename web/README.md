## MailShield Web Dashboard

This app powers the MailShield landing, onboarding flow, and customer dashboard. It is designed to run on **Netlify** and integrates with Clerk (auth), Stripe (billing), and the FastAPI backend deployed on Railway.

### Stack

- **Next.js App Router** with TypeScript
- **Tailwind CSS + shadcn/ui** (neutral palette)
- **Clerk** for authentication
- **Netlify Functions** for server-side admin endpoints
- **Stripe** (Checkout + Portal) for billing flows
- **PostgreSQL** shared with the FastAPI service

### Local development

```bash
cd web
npm install
npm run dev
```

Visit `http://localhost:3000`. The marketing page, Clerk auth routes, and dashboard stubs are available. Netlify Functions are mocked for now (see `netlify/functions/*`).

### Environment variables

Copy `.env.example` to `.env` and fill in the required values:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_APP_URL=http://localhost:8888
INTERNAL_API_TOKEN=dev_internal_token
DATABASE_URL=postgres://user:pass@host:5432/mailshield
STRIPE_PUBLIC_KEY=pk_test_stripe
STRIPE_SECRET_KEY=sk_test_stripe
STRIPE_PRICE_METERED=price_metered_id
STRIPE_PRICE_STARTER=price_starter_id
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

> Clerk keys are required to render auth components, even during local development.

### Project structure

```
src/
  app/             Next.js routes (marketing, dashboard, docs, auth)
  components/      UI components and dashboard layout
  lib/             Shared utils (env parsing, db pool, constants)
netlify/
  functions/       Admin APIs for keys, usage, billing (placeholders)
netlify.toml       Netlify build + redirects
```

### Netlify

- Build command: `npm run build`
- Publish directory: `out`
- Functions directory: `netlify/functions`
- Redirect `/api/*` → `/.netlify/functions/*`

### Next steps

1. Replace Netlify function stubs with real implementations (Clerk auth check, PostgreSQL queries, Stripe SDK calls).
2. Hook dashboard components to those endpoints.
3. Configure Netlify environment variables and deploy.
4. Point `app.yourdomain.com` to Netlify and `api.yourdomain.com` to Railway.
