# Deploying Dylanquent — free hosting

The app ships as a Docker image, so it runs unchanged on any container host.
This guide covers the genuinely free route first.

---

## Recommended: Oracle Cloud Always Free + Coolify — R0/month

Oracle's Always Free tier gives a real virtual machine (up to 4 ARM cores,
24 GB RAM, 200 GB disk) at no cost, indefinitely. Coolify is a free,
open-source, self-hosted alternative to Vercel: connect GitHub, push to
deploy, automatic SSL.

Because it is a real server with a persistent disk, SQLite works, image
uploads work, and the queue worker and scheduler run properly — all of
which serverless hosts cannot do.

**Trade-offs, honestly:** ARM capacity is often unavailable in popular
regions and you may need to retry or pick another region. Signup requires a
credit card for identity verification (it is not charged on Always Free
resources). You are the sysadmin — Coolify handles deploys, but OS updates
are yours.

### Steps

1. **Create the server.** Sign up at cloud.oracle.com. Create a VM instance:
   shape `VM.Standard.A1.Flex`, 2 OCPU / 12 GB RAM, Ubuntu 22.04 or 24.04.
   Save the SSH key it gives you. If you get an out-of-capacity error, try a
   different availability domain or region.

2. **Open the firewall.** Two places, both required:
   - Oracle console: on the instance's subnet, add ingress rules for TCP 80,
     443 and 8000 from `0.0.0.0/0`.
   - On the server itself, Ubuntu also blocks these by default:
     ```
     sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
     sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
     sudo iptables -I INPUT -p tcp --dport 8000 -j ACCEPT
     sudo netfilter-persistent save
     ```

3. **Install Coolify.**
   ```
   ssh ubuntu@<server-ip>
   curl -fsSL https://cdn.coolify.io/coolify/install.sh | sudo bash
   ```
   Then open `http://<server-ip>:8000` and create the admin account.

4. **Connect the repo.** In Coolify: New Resource → Application → GitHub.
   Authorise it against `DylanPather/dylanquent`, pick the branch, and set
   the build pack to **Dockerfile**. Coolify finds the `Dockerfile` at the
   repo root.

5. **Set environment variables.** Paste from `.env.production.example`.
   Generate the key locally with `php artisan key:generate --show` and set
   `APP_KEY`. Set `APP_URL` to your domain.

6. **Add persistent volumes** so data survives redeploys:
   | Mount path | Holds |
   |---|---|
   | `/var/www/html/database` | the SQLite database |
   | `/var/www/html/storage/app/public` | uploaded product images |

   Skipping this wipes your orders on every deploy.

7. **Deploy.** Press Deploy. The container migrates the database, caches
   config and routes, and starts nginx, PHP-FPM, the queue worker and the
   scheduler.

8. **Seed the catalog** (first deploy only, and only if you want the demo
   products). In Coolify's terminal for the container:
   ```
   php artisan db:seed --force
   ```
   All seeders are idempotent, so re-running is safe.

---

## Domain: GoDaddy + Cloudflare

Cloudflare is free and gives you DNS, CDN and SSL.

1. Add your domain at cloudflare.com; it reads your existing records.
2. Cloudflare shows two nameservers. In GoDaddy: **My Products → Domain →
   Nameservers → Change → I'll use my own**, and enter both. Propagation
   usually takes under an hour.
3. In Cloudflare DNS, add:
   | Type | Name | Value | Proxy |
   |---|---|---|---|
   | A | `@` | your server IP | Proxied |
   | A | `www` | your server IP | Proxied |
4. SSL/TLS mode: **Full (strict)**.
5. In Coolify, set the application domain to `https://dylanquent.com` and
   enable Let's Encrypt.

---

## Deploying to Vercel

The repo now carries `vercel.json` and `api/index.php`, so Vercel can run it.
Read the constraints below before relying on it.

### What works and what does not

| | Status |
|---|---|
| Storefront, studio, product pages, cart | Work |
| Database | **Postgres required** — SQLite cannot work on a read-only filesystem |
| Admin image uploads | **Need Cloudflare R2 or Vercel Blob.** Seeded images in `public/` are served fine; new uploads have nowhere to go until `FILESYSTEM_DISK=s3` is configured |
| Queue worker | None. Mail sends inline, so this is survivable today |
| Scheduler / cron | None on the free tier |
| Cold starts | Laravel boots on each idle invocation |
| Commercial use | The Hobby (free) plan is for non-commercial projects |

### Steps

1. **Create the database.** In the Vercel dashboard: Storage → create a
   Neon Postgres database. Copy the connection details.

2. **Import the repo.** vercel.com/new → pick `DylanPather/dylanquent`.
   Framework preset: **Other**. Vercel reads `vercel.json` for the rest.

3. **Set environment variables** (Project Settings → Environment Variables):
   ```
   APP_NAME=Dylanquent
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=            # php artisan key:generate --show
   APP_URL=https://your-project.vercel.app

   DB_CONNECTION=pgsql
   DB_HOST=            # from Neon
   DB_PORT=5432
   DB_DATABASE=
   DB_USERNAME=
   DB_PASSWORD=
   DB_SSLMODE=require

   SESSION_DRIVER=database
   CACHE_STORE=database
   QUEUE_CONNECTION=sync     # no workers exist on Vercel
   FILESYSTEM_DISK=public
   LOG_CHANNEL=stderr
   ```

4. **Run migrations from your machine**, since Vercel has no deploy hook or
   shell. Point a local env file at the Neon database and run:
   ```
   php artisan migrate --force
   php artisan db:seed --force      # first deploy only
   ```

5. **Deploy.** Push to the connected branch.

6. **Domain.** Vercel → Project → Domains → add `dylanquent.com`. It shows
   the records to create. In GoDaddy (or Cloudflare, if you moved
   nameservers there), add the `A` / `CNAME` it asks for.

### If the first deploy fails

`vercel-php` is a community runtime and its version moves. The most common
fixes:

- Bump the runtime version in `vercel.json` (`vercel-php@0.7.3`) to the
  current release.
- If assets 404, confirm `npm run build` ran in the build log and that
  `public/build` exists in the deployment.
- If you get a 500 with no detail, set `APP_DEBUG=true` temporarily and
  read the function logs, then turn it back off.

### Moving uploads to R2 later

Uploads already follow `FILESYSTEM_DISK`, so this is configuration only:
set it to `s3` and fill in the `AWS_*` values in
`.env.production.example`. No code change.

---

## Alternatives

| Host | Cost | Catch |
|---|---|---|
| Hetzner VPS + Coolify | ~$5/mo | Same setup, no capacity lottery. Worth it once you take real orders. |
| Render free tier | Free | Sleeps after ~15 min idle (~50s cold start); free Postgres expires; ephemeral disk loses uploads. Demo only. |
| Railway / Fly.io | ~$5/mo | Trial credit, then paid. Needs Postgres + R2 since the disk is ephemeral. |
| Vercel | ~$20/mo | Hobby tier forbids commercial use. Needs the community PHP runtime, Postgres and R2, and still has no queue worker or cron. |

To move to a host without a persistent disk, change two things: point
`DB_*` at a free Neon Postgres, and set `FILESYSTEM_DISK=s3` with Cloudflare
R2 credentials. Uploads follow that setting automatically — no code change.

---

## Before taking real money

- [ ] `APP_DEBUG=false` and a unique `APP_KEY` (never reuse the dev one)
- [ ] Real `MAIL_*` credentials — order confirmations vanish while `MAIL_MAILER=log`
- [ ] Live Stripe keys and the webhook secret
- [ ] Replace demo stock with real counts (`StorefrontInventorySeeder` is demo data)
- [ ] Change the seeded admin password — `admin@dylanquent.com` / `password` is public in the repo
- [ ] Set up database backups (`/var/www/html/database` volume)
- [ ] Audit the checkout and payment flow — not yet reviewed

## Local production-parity test

```
cp .env.production.example .env.production   # fill in APP_KEY
docker compose up --build
```
Then open http://localhost:8080.
