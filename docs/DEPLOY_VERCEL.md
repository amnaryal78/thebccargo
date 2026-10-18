# Deploy The BC Cargo on Vercel (auto-update from GitHub) and move the domain

Goal: every push to the GitHub `main` branch updates https://thebccargo.com by itself.
Domain DNS is edited in the **Babal Host** admin panel (the registrar is OwnRegistrar; nameservers `13229.dns1-4.managedns.org`).

## How the pieces fit

| Part | Where it runs | Why |
|---|---|---|
| Website (React app, prerendered pages) | **Vercel** | Static hosting, auto-deploys from GitHub |
| Chatbot and blog-fixer API (`/api/chat`, `/api/fix-blog`) | **Render** (kept running) | The existing Node server holds the OpenRouter key. `vercel.json` forwards `/api/*` to it |
| Database and login | **Supabase** | Unchanged |
| Email (Zoho) | Zoho | Unchanged. Do not touch the MX, TXT and DKIM records |

`vercel.json` in the repo root already contains the build settings, security headers (same as `server.js`), the 6 permanent redirects, the single-page-app fallback and the `/api` forwarding. You do not need to type any of it in Vercel.

> Plan note: Vercel's free Hobby plan is for personal, non-commercial use. A business website should be on the Pro plan.

---

## Part 1. Put the repo on GitHub (once)

1. Make sure `vercel.json` is in the **root** of https://github.com/amnaryal78/thebccargo on branch `main`.
2. Open the repo on GitHub and confirm you see `package.json`, `vercel.json`, `src/`, `public/` at the top level.

## Part 2. Create the Vercel project

1. Go to https://vercel.com and sign up or log in with **GitHub** ("Continue with GitHub").
2. Click **Add New... -> Project**.
3. Under "Import Git Repository", find `amnaryal78/thebccargo`. If it is missing, click **Adjust GitHub App Permissions**, allow the repo, and come back.
4. Click **Import**.
5. On the configure screen leave these as detected (they come from `vercel.json`):
   - Framework Preset: **Vite**
   - Root Directory: leave **empty** (repo root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Open **Environment Variables** and add these three (Production, Preview and Development all ticked):

   | Name | Value | Where to copy it from |
   |---|---|---|
   | `VITE_SUPABASE_URL` | `https://xtipmcthdyyubohspjro.supabase.co` | Supabase -> Project Settings -> API |
   | `VITE_SUPABASE_ANON_KEY` | the **anon / publishable** key | Supabase -> Project Settings -> API |
   | `VITE_TURNSTILE_SITE_KEY` | your Cloudflare Turnstile **site** key | Cloudflare -> Turnstile |

   Never add the Supabase `service_role` key, `OPENROUTER_API_KEY` or any "secret" key in Vercel. The names starting `VITE_` are baked into the public site.
7. Click **Deploy**. The first build takes 1 to 3 minutes.
8. When it finishes you get a test address like `thebccargo-xxxx.vercel.app`. Open it and check the home page, `/rates` and `/faq` load.

### Set the Node version

Project -> **Settings -> General -> Node.js Version** -> choose **22.x** -> Save. Then **Deployments -> latest -> ... -> Redeploy**.

## Part 3. Turn on automatic updates (already default, verify it)

1. Project -> **Settings -> Git**.
2. **Production Branch** must be `main`.
3. Leave "Automatically expose System Environment Variables" as is.
4. From now on:
   - Push or merge to `main` -> Vercel builds and updates thebccargo.com automatically.
   - Push to any other branch or open a pull request -> Vercel makes a separate **Preview** link, the live site is not touched.
5. Test it: change one word in `public/robots.txt` or a page on GitHub, commit to `main`, watch **Deployments** show a new build, and refresh the live site after it says **Ready**.

## Part 4. Add the domain in Vercel

1. Project -> **Settings -> Domains**.
2. Type `thebccargo.com` -> **Add**. Then add `www.thebccargo.com` as a second domain in the same project. **Both names must be added to the same Vercel project** so they are one site, never two.
   - `vercel.json` already contains a rule that sends every `www.thebccargo.com/...` address to the same page on `https://thebccargo.com/...` with a permanent redirect. So both addresses always end up on the same single site, and Google sees only one.
   - If Vercel also offers "Redirect to thebccargo.com" for the www domain, you may choose it. It does the same thing.
3. Vercel will show "Invalid Configuration" with the DNS records it wants. **Write down exactly what it shows.** Newer projects show their own values such as `xxxx.vercel-dns-017.com`. Use the values on your screen. The usual defaults are:

   | Type | Host | Value |
   |---|---|---|
   | A | `@` | `76.76.21.21` |
   | CNAME | `www` | `cname.vercel-dns.com` |

Do not click Verify yet. Change DNS first (Part 5).

## Part 5. Change DNS in the Babal Host admin panel

Open the domain's **DNS Management** page (the page with Host Name, Record Type, Address and Priority columns).

**Delete** these rows:

- All four `A` rows for `thebccargo.com` with address `216.24.57.1` (the old Render address).
- The `www` CNAME row that points to `thebccargo.onrender.com`.
- Any `AAAA` row for `thebccargo.com`, if you have one.

**Add** these rows (use the values Vercel showed you in Part 4):

| Host Name | Record Type | Address |
|---|---|---|
| `thebccargo.com` | A (Address) | `76.76.21.21` |
| `www.thebccargo.com` | CNAME (Alias) | `cname.vercel-dns.com` |

**Keep exactly as they are** (this is your company email):

- `thebccargo.com` SPF/TXT `zoho-verification=...`
- `thebccargo.com` MX `mx.zoho.com` (10), `mx2.zoho.com` (20), `mx3.zoho.com` (50)
- `zmail._domainkey...` TXT starting `v=DKIM1`

Then scroll to the bottom of the page and click **Save / Update / Apply**. Some panels need that final click, and without it nothing changes.

Tips:
- Keep only **one** A row for the root, and only **one** row for `www`. A name can have only one CNAME.
- Do not move the nameservers to Vercel. Leave them at `managedns.org` and only change the records above, so Zoho email keeps working.

## Part 6. Verify the domain and wait for HTTPS

1. Wait 5 to 10 minutes, then Vercel -> Settings -> Domains -> **Refresh** (or Verify).
2. Both domains should show a green tick. Vercel then issues the HTTPS certificate by itself, usually within a few minutes.
3. DNS can take up to an hour in rare cases. To check before Vercel does, from a terminal:

```bash
nslookup -type=A thebccargo.com 13229.dns1.managedns.org
nslookup -type=CNAME www.thebccargo.com 13229.dns1.managedns.org
```

The first must show `76.76.21.21`, the second `cname.vercel-dns.com`. If you still see `216.24.57.1` or `github.io`, the panel did not save.

## Part 7. Connect login and the API to the new address

1. **Supabase** -> Authentication -> URL Configuration:
   - Site URL: `https://thebccargo.com`
   - Redirect URLs: add `https://thebccargo.com/**` and `https://www.thebccargo.com/**`
2. **Render** (keep this service; it serves `/api/chat` and `/api/fix-blog`):
   - Environment must keep `OPENROUTER_API_KEY` set.
   - The free plan sleeps after about 15 minutes idle, so the first chatbot reply after a quiet period is slow. Upgrade the plan to remove that.
   - Remove `thebccargo.com` and `www.thebccargo.com` from Render -> Settings -> Custom Domains so the two services do not fight over the name.
3. **Cloudflare Turnstile**: make sure `thebccargo.com` is in the allowed hostnames of your Turnstile widget.

## Part 8. Final checks

Run these (or open them in a browser):

```bash
curl -I https://thebccargo.com/            # expect 200 and header "server: Vercel"
curl -I https://www.thebccargo.com/        # expect 308 redirect to https://thebccargo.com/ (same site)
curl -I https://www.thebccargo.com/rates   # expect 308 redirect to https://thebccargo.com/rates
curl -I http://thebccargo.com/             # expect redirect to https
curl -s https://thebccargo.com/api/health  # expect {"status":"healthy",...}
curl -s https://thebccargo.com/robots.txt  # expect the Sitemap line
```

In the browser: home page, `/rates`, a country page, tracking, the contact form, the chatbot, Google login and the admin shipment page.

## Everyday workflow after this

1. Edit code locally (or on GitHub).
2. Commit and push to `main`.
3. Vercel builds automatically. Watch it in **Deployments**. Green "Ready" means it is live.
4. If something breaks: Deployments -> pick the last good one -> **...** -> **Promote to Production** (instant rollback).

## Troubleshooting

| Problem | Fix |
|---|---|
| Build fails with "Cannot find module" | Redeploy; confirm Node 22.x and that `package-lock.json` is committed |
| Blank page, console says wrong MIME type | The build did not run. Output Directory must be `dist`, Framework Vite |
| Page not found after refreshing a deep link | `vercel.json` must be in the repo root. Redeploy |
| Domain shows "Invalid Configuration" | DNS not saved or an old A row is still there. Re-check Part 5 and the `nslookup` commands |
| Browser says certificate error | Wait 10 minutes after the green tick; it is still issuing |
| Chatbot says error or is very slow | The Render service is asleep or `OPENROUTER_API_KEY` is missing on Render |
| Google login fails | Fix the Supabase URLs in Part 7 |
| Old site still shows | Hard refresh (Ctrl+Shift+R). The service worker can cache the old version for one visit |
| Email stopped | A Zoho MX, TXT or DKIM row was deleted. Re-add exactly the ones listed in Part 5 |

## Going back to Render if needed

In Babal Host DNS set `thebccargo.com` A to `216.24.57.1` and `www` CNAME to `thebccargo.onrender.com`, and re-add both domains in Render -> Custom Domains.
