🧩 1. Objectif de la partie web

La webapp Netlify sert à :

créer un compte et se connecter (auth),

gérer les clés API (créer / révoquer / afficher),

voir ses statistiques d’usage,

gérer son abonnement et la facturation (Stripe),

accéder à un dashboard visuel et aux snippets d’intégration.

Ton API FastAPI sur Railway reste le moteur technique :

elle gère /v1/check-email pour les clients,

stocke les usages quotidiens dans PostgreSQL,

peut recevoir les webhooks Stripe si tu veux.

🏗️ 2. Structure du projet

Dans ton dossier principal :

mailshield/
├─ api/      → ton backend FastAPI (Railway)
└─ web/      → nouvelle webapp (Netlify)

Dans web/

Frontend (UI) : Next.js ou React + Tailwind + shadcn/ui

Backend léger : Netlify Functions (Node) pour les routes admin :

création/révocation de clés API,

lecture des usages,

création d’un paiement Stripe,

gestion du portail client Stripe.

🔐 3. Authentification (Clerk)

Crée un projet sur clerk.com
.

Installe l’intégration Netlify + Clerk.

Ajoute tes clés Clerk dans les variables d’environnement Netlify :

CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...


Dans ton interface web :

Ajoute les composants “Sign up”, “Sign in”, et “User button”.

Protège toutes les pages /dashboard/* pour utilisateurs connectés.

🟢 Résultat : les utilisateurs peuvent créer un compte et se connecter.
Tu récupères leur userId / email pour relier à ta base.

💾 4. Base de données (PostgreSQL)

Tu peux utiliser la même base Postgres que ton API Railway.
Elle doit contenir au minimum :

accounts → utilisateurs / clients

api_keys → clés API liées aux comptes

usage_daily → consommation par jour

La webapp lira et écrira dans ces tables (via Netlify Functions).

🧮 5. Facturation (Stripe)

Crée un compte Stripe (test mode d’abord).

Crée :

un produit et prix “metered” (facturation à l’usage),

un prix “abonnement fixe” (plan pro ou starter).

Ajoute les variables d’environnement sur Netlify :

STRIPE_PUBLIC_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_PRICE_METERED=...
STRIPE_PRICE_STARTER=...
STRIPE_WEBHOOK_SECRET=...


Intègre Stripe :

“Upgrade” → lance un Checkout,

“Manage subscription” → ouvre le Portail client Stripe.

Tu peux choisir où recevoir les webhooks Stripe :

soit sur ton API Railway (plus fiable pour process long),

soit sur une Function Netlify.

🔐 6. API Keys Management

Depuis le dashboard web :

Créer une clé → générée côté serveur (Netlify Function), hashée en DB, affichée une seule fois.

Afficher → on montre uniquement les 6 derniers caractères.

Révoquer → la clé est désactivée dans la base.

💡 Côté API (Railway), le middleware d’auth doit refuser toute clé révoquée.

📊 7. Dashboard & UI

Pages principales :

Page	Rôle
/login / /signup	Auth Clerk
/dashboard	Résumé global (usage, plan, statut, dernière clé API)
/dashboard/api-keys	Liste, création, suppression de clés
/dashboard/usage	Graphiques de consommation
/dashboard/billing	Plan, factures, portail Stripe
/docs/quickstart	Tutoriel + snippets (curl, Node, Python)
Design

UI kit : shadcn/ui
 + Tailwind CSS

Graphiques : Recharts

Palette : sombre moderne (#0b0d10, accents bleus #3b82f6)

💡 Layout “dashboard” classique avec une sidebar et un header :

[MailShield logo] | Dashboard | API Keys | Usage | Billing | Docs | [User Avatar]

🧰 8. Netlify Functions (backend serveur)
À créer :
Fonction	Rôle
admin-keys-create	Crée une clé API (et la retourne une seule fois)
admin-keys-revoke	Révoque une clé API existante
admin-usage	Retourne les stats d’usage pour le compte connecté
billing-checkout	Crée une session Stripe Checkout
billing-portal	Ouvre le portail client Stripe
me	Retourne les infos du compte actuel

Toutes les fonctions :

Vérifient la session Clerk.

Communiquent avec la base PostgreSQL ou ton API interne (Railway).

Retourne du JSON (consommé par ton frontend React/Next).

🧭 9. Connexion avec ton API sur Railway

La webapp Netlify ne fait pas d’appels directs à /v1/check-email.
👉 Cette route est destinée aux clients de MailShield.

La webapp parle à ton API admin (ou directement à la base) pour :

récupérer les usages (usage_daily),

valider/révoquer les clés,

éventuellement lire des stats systèmes.

Tu peux utiliser un token interne (INTERNAL_API_TOKEN) pour sécuriser ces échanges.

☁️ 10. Déploiement & hébergement

Créer un site Netlify

Connecte ton repo GitHub (web/).

Configure les variables d’environnement (Clerk, Stripe, DB, API_BASE...).

Ajoute un netlify.toml avec la redirection /api/* → /.netlify/functions/*.

Déploie ton API sur Railway

Garde tes variables Redis, Postgres, Stripe Webhook.

Vérifie que /health répond bien.

DNS

app.tondomaine.com → Netlify

api.tondomaine.com → Railway