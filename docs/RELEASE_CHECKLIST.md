# Release checklist

Run before a merge to `main` and again on flashbind.com after Oxygen reports the deploy. Local testing can't catch everything: Oxygen serves our scripts, styles and fonts from `cdn.shopify.com`, so security-policy (CSP) and CDN problems only show up live.

## Before merging

- [ ] `npm test`, `npm run typecheck`, `npm run build`, and `npm run lint` on the changed files
- [ ] `git diff --check`; only the intended files are staged
- [ ] Any database migration is applied to production first and verified (row-level security, grants, data unchanged)
- [ ] Screenshots of the changed pages at 375, 390 and 1440 px

## After the deploy (on flashbind.com, fresh browser profile)

- [ ] The Oxygen deploy run succeeded and the live HTML serves the new build
- [ ] **Fonts load**: on the homepage, a product page and a /p/ demo page, `document.fonts` shows Plus Jakarta Sans `loaded`, and headings render in it (not a system font)
- [ ] **No console errors**: no Content Security Policy or font errors on those three pages
- [ ] **/p/ pages**: zero cookies, no cookie banner, no third-party requests except our own files on `cdn.shopify.com/oxygen-v2/`
- [ ] **Tags**: one review stand demo works; one menu, one pet and one Wi-Fi tag behave as before (unclaimed tags redirect to `/setup/{id}`)
- [ ] **Checkout**: add a product to the cart, open checkout, and check the price and the order summary. Never pay.
- [ ] **Quote form** opens with the product pre-selected from a "Request a quote" button
- [ ] **SEO**: `/sitemap.xml`, `/sitemap-pages.xml` and `/robots.txt` return 200; every sitemap URL returns 200; one canonical link per page
- [ ] **Speed**: PageSpeed Insights (mobile) for the homepage, with no large drop against the last run

## Rollback

Shopify admin → Hydrogen → FlashBind storefront → Deployments → previous deployment → make current. Or `git revert` the merge on `main` and push. Database rollbacks are listed in each migration file.
