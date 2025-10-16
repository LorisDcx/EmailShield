✅ Résumé du projet (1 paragraphe)

Construire EmailShield : une API simple et rapide qui détecte les emails jetables/temporaires lors de l’inscription à un service. Les clients (indie hackers, SaaS) appellent POST /v1/check-email et reçoivent un verdict (ok | suspect | disposable) + score + reasons. Le service privilégie coût minimal (cache agressif) et faibles faux positifs, avec un pricing pay-as-you-go et un free tier.

🎯 Objectifs & principes

p95 < 200 ms par requête (UE).

Cache hit ≥ 80% (Redis + TTL).

Faux positifs minimisés (mode soft, whitelist).

Coût infra < 25 €/mois au début (Railway).

SDKs dev-friendly (Node & Python en V1).

Doc claire + snippet “copy/paste”.

👤 Cibles & use cases

SaaS early stage / indie hackers / e-commerce : filtrer inscriptions et limiter l’abus.

Outils no-code : via plugin (V2).

Email marketing : nettoyage à la volée via endpoint bulk.

🧱 Architecture (vue d’ensemble)

API : Python FastAPI + Uvicorn.

Cache : Redis managé Railway.

Blocklist : fichier blocklist.txt (top domaines jetables) chargé en mémoire ; maj via job.

DNS/MX : dnspython avec resolver local (cache DNS) → réduit latence.

(Optionnel) DB Postgres pour analytics/billing (V1 peut s’en passer).

Infra : Railway (Nixpacks). Région EU.

Observabilité : logs Railway + Sentry (erreurs) + métriques de base.

Client App ──> FastAPI (Railway) ── Redis (cache verdicts/MX)
                         │
                    DNS resolver (MX)
                         │
                    blocklist en mémoire (maj cron)

📡 Endpoints (V1)
1) POST /v1/check-email

Body

{ "email": "user@example.com", "ip": "1.2.3.4", "user_agent": "Mozilla/5.0" }


200 OK

{
  "email": "user@example.com",
  "domain": "example.com",
  "classification": "ok",            // ok | suspect | disposable
  "score": 0.12,                     // 0.0 -> 1.0
  "reasons": ["mx_ok","not_in_blocklist"],
  "ttl_seconds": 86400,              // conseil de cache
  "checked_at": "2025-10-16T15:32:00Z",
  "version": "v1"
}


Erreurs
400 invalid_email | 401 unauthorized | 429 rate_limited | 5xx service_error

2) POST /v1/check-bulk

Jusqu’à 100 emails/appel.

Facturation : par email traité.

Réponse : tableau de résultats + métriques (nb ok/suspect/disposable).

3) GET /health

Santé de l’API (pour Railway healthcheck).

(V2 : endpoints admin — whitelist/blacklist, stats, webhooks.)

🧠 Logique de détection (V1)

Ordre cheap → expensive :

Validation format (regex).

Blocklist domaine (set en mémoire).

Cache verdict de domaine (mx:domain) dans Redis.

DNS/MX lookup si pas en cache (timeout 1.5s).

Heuristiques légères :

mots-clés (temp, 10min, mailinator, guerrilla…)

entropie/longueur du local-part (simple)

Scoring & classification :

score = 0
if domain_in_blocklist: +0.9 (reason: domain_blocklist)
if mx_missing:          +0.6 (reason: mx_missing)
if keyword_match:       +0.2 (reason: keyword_match)
if entropy>threshold:   +0.2 (reason: high_entropy)

classification = score>0.8 ? "disposable"
               : score>0.4 ? "suspect"
               : "ok"


TTL conseillé côté client : renvoyer ttl_seconds (par défaut 24h).

🧩 Données & structures

blocklist.txt : 1 domaine par ligne, commentaires #. Chargé au boot.

Redis keys

mx:{domain} → "1"/"0" (TTL = 24h par défaut).

q:count:{apikey}:{YYYYMMDD} (si comptage simple V1).

(Optionnel) Postgres (V2)

accounts(id, email, plan, api_key_hash, created_at)

usage(account_id, day, count)

whitelist(domain, account_id?)

blacklist(domain, source, updated_at)

🔐 Sécurité & quotas

Auth : Header Authorization: Bearer <API_KEY>.

Rate-limit (clé API) : p.ex. 10 req/s (429 au-delà).

CORS : désactivé (backends only). Pas d’appel direct depuis le front.

Logging : ne jamais stocker l’email complet en clair dans les logs. Si besoin, hacher le domain (ou tronquer le local-part).

RGPD : minimiser données, TTL log court (7–14j), DPA prêt (V2), hébergement UE.

🧪 Qualité : tests & métriques

Tests unitaires : parsing, scoring, DNS mock (mx présent/absent).

Tests intégration : endpoint 200/400/401/429/5xx.

Load test : k6 sur /v1/check-email (objectif p95<200ms).

Métriques :

latence p50/p95/p99

taux de cache hit Redis

taux de ok/suspect/disposable

erreurs par type

appels par clé API (pour billing)

🚀 Déploiement (Railway)

Repo : inclure app.py, requirements.txt, Railway.toml, blocklist.txt.

Railway.toml

[build]
builder = "NIXPACKS"
[deploy]
startCommand = "uvicorn app:app --host 0.0.0.0 --port ${PORT}"
healthcheckPath = "/health"
healthcheckTimeout = 10


Services Railway :

Web FastAPI

Redis managé

Env vars :

REDIS_URL (depuis service Redis)

CACHE_TTL_SECONDS=86400

API_KEYS (liste séparée par virgule pour V1 simple) ou API_KEYS_SIGNING_SECRET (JWT V2)

SENTRY_DSN (optionnel)

Région : EU.

Domain : branch prod (autodeploy on merge).

💳 Billing pay-as-you-go (V1 simple)

Compter 1 appel réussi = 1 unité (dans Redis : incr q:count:{apikey}:{date}).

Free tier : p.ex. 1 000/mois (soft limit + alerte).

Plans :

Starter : 25k/mo (9 €)

Pro : 200k/mo (49 €)

Overages : palier €/k.

Stripe (V2) :

Portal + webhooks (usage → facture en fin de période).

Alertes 80/100% par email.

📦 SDKs & intégrations (priorités)

SDK Node (V1) : @emailshield/node

checkEmail(email: string): Promise<Result>

SDK Python (V1) : emailshield

check_email(email: str) -> dict

Examples : Express middleware, FastAPI dependency.

V2 :

WordPress plugin (WooCommerce, WPForms…)

NextAuth middleware

Zapier / Make integration

/check-bulk + Postman collection

📚 Documentation (structure)

Home : pitch + curl en 10 sec + Get API Key.

Quickstart : Node/Python (copier-coller).

API Reference : endpoints, schémas, erreurs, codes.

Guides : “Bloquer proprement sans frustrer” (mode soft), “Réduire les faux positifs”.

FAQ : RGPD, latence, quotas, pricing.

Status : simple page de statut (même statique au début).

🔭 Roadmap (6 semaines)

Semaine 1

API /v1/check-email + cache Redis + blocklist en mémoire.

Healthcheck + logs + Sentry.

Script d’import blocklist (cron quotidien).

Semaine 2

Rate-limit par API key + comptage Redis/day.

/v1/check-bulk (100 max).

SDK Node + Python (minimal).

Doc Quickstart + API Ref.

Déploiement Railway (EU) + domaine custom.

Semaine 3

Optimisation DNS (resolver local, timeouts).

Mode soft + whitelist (fichier local V1).

Postman collection + exemples Express/FastAPI.

Page Landing (Vercel/Framer) + formulaire Get API Key.

Semaine 4

Lancement Product Hunt, Indie Hackers, Reddit.

Ajout métriques publiques (hits, taux de jetables).

Amélioration doc et FAQ (RGPD).

Semaine 5

Dashboard minimal (auth simple) : usage par clé, top domaines bloqués.

Alertes usage (80/100%).

Tests charge k6, tuning TTL/Timeouts.

Semaine 6

Stripe (plans fixes + overages) ou invoicing simple.

Whitelist/Blacklist API (admin).

Plugin WordPress (MVP).

💬 Messages & UX côté clients

Erreur front (disposable) :
“Cette adresse semble temporaire. Utilise une adresse permanente pour créer ton compte.”

Mode soft (suspect) :
“Nous avons besoin de vérifier ton email. Vérifie ta boîte de réception.”

📈 Go-to-market (exécution)

Landing : headline fort + snippet + CTA Get API Key + free tier.

PH Launch (screens, GIF, tagline), cross-post IndieHackers & X.

Open-source : mini blocklist “top 10k” + SDKs → SEO + crédibilité.

Articles : “Comment bloquer 95% des emails jetables en 5 min (FastAPI/Express)”.

Plugins : WordPress/NextAuth = adoption facile → leads.

Mesure : conversion free→pay, churn, latence, cache hit.

✅ Critères d’acceptation (V1 prêt)

/v1/check-email répond <200 ms p95, <1% erreurs 5xx sur 10k req.

Rate-limit + auth clé API opérationnels.

Cache hit Redis > 80% après warmup.

Doc Quickstart + SDK Node/Python publiés.

Déploiement Railway stable (healthcheck OK).

Free tier activé + compteur usage par clé.

🧩 Annexe : variables d’environnement (V1)
REDIS_URL=redis://:pass@host:port/0
CACHE_TTL_SECONDS=86400
API_KEYS=sk_live_xxx,sk_live_yyy               # V1 simple
SENTRY_DSN=...                                  # optionnel
REGION_HINT=eu                                  # pour logs/metrics