# Fake Boot Redirect

Four self-contained HTML pages that play an "operating system boot" animation and
then redirect the visitor to another page. There are also two optional entry points
that randomly choose one template and keep that choice stable for a short time, so
refreshing the page replays the same animation:

- `index.php` — for any PHP-enabled web host.
- `functions/index.js` — a Cloudflare Pages Function (same behavior, no PHP needed).

No build step, no external CSS/JS. The HTML files work on their own.

> **Using this project? Replace my site's info first.** These files ship pre-filled
> with my details — site URL `https://vss.dev`, brand `VSS`, and the page
> title/description "Victor Santos' Projects & Knowledge Base". Before you publish,
> swap all of that for **your own** URL, brand, title, and description. See
> [Make it yours](#make-it-yours--replace-my-site-info) below for the exact list of
> things to change.

## The four styles

| File | Style | Vibe |
|------|-------|------|
| [`retro-bios.html`](retro-bios.html) | Retro BIOS / POST | Amber CRT, memory count, `[ OK ]` checks, scanlines |
| [`linux-terminal.html`](linux-terminal.html) | Linux systemd boot | Green/blue service log scrolling to a login prompt |
| [`modern-glass.html`](modern-glass.html) | Modern frosted glass | Apple/Win11-style logo + animated progress ring |
| [`cyberpunk-matrix.html`](cyberpunk-matrix.html) | Cyberpunk uplink | Matrix rain, glitch title, "decrypting" feed |
| [`index.php`](index.php) | Random picker (PHP) | Chooses one of the four templates and remembers it for 5 minutes |
| [`functions/index.js`](functions/index.js) | Random picker (Cloudflare Pages) | Same as `index.php`, for Cloudflare Pages hosting |

Pick one, or keep several and link to whichever fits the moment.

---

## Random template entry point

Use [`index.php`](index.php) if you want visitors to get one of the four boot
animations automatically.

How it works:

1. On the first visit, PHP randomly selects one template.
2. The selected template name is saved in a `boot_template` cookie.
3. For the next 5 minutes, refreshes show the same animation again.
4. After the cookie expires, a future visit can receive a different template.

This avoids the page feeling too random when someone refreshes to watch the
animation again.

### Template URLs

Force a specific template:

```
index.php?template=retro-bios
index.php?template=linux-terminal
index.php?template=modern-glass
index.php?template=cyberpunk-matrix
```

Force a new random pick:

```
index.php?shuffle=1
```

The chosen template still accepts the normal animation query params, so this also
works:

```
index.php?template=cyberpunk-matrix&duration=8&brand=ACME
```

To change how long the random choice is remembered, edit this line in
`index.php`:

```php
$cookieLifetime = 5; // minutes
```

---

## Cloudflare Pages (no PHP)

Cloudflare Pages can't run PHP, so [`functions/index.js`](functions/index.js) is a
**Pages Function** that does exactly what `index.php` does: it picks a template
(from `?template=`, the cookie, or at random), remembers it in a `boot_template`
cookie, and serves the matching HTML. The four `.html` files are served as static
assets and the Function reads the chosen one through the built-in `ASSETS` binding.

The project layout Pages expects:

```
.
├── functions/
│   └── index.js          ← intercepts "/" (replaces index.php)
├── retro-bios.html
├── linux-terminal.html
├── modern-glass.html
└── cyberpunk-matrix.html
```

### Deploy

1. Push this folder to a Git repo (GitHub/GitLab) and create a project in the
   Cloudflare Pages dashboard, **or** deploy with Wrangler.
2. Build settings: **Build command** = *(none)*, **Build output directory** = `/`
   (the repo root). Pages auto-detects the `functions/` directory — no extra config.
3. Visit your `*.pages.dev` URL. The root `/` runs the picker; the same query
   params work:

```
/?template=cyberpunk-matrix
/?shuffle=1
/?template=cyberpunk-matrix&duration=8&brand=ACME
```

### Test locally

```
npm install -g wrangler
wrangler pages dev .
```

Then open the printed `http://localhost:8788/` address.

To change how long the random choice is remembered, edit this line in
`functions/index.js`:

```js
const COOKIE_LIFETIME = 5; // minutes
```

> Note: the `.html` files stay directly reachable (e.g. `/retro-bios.html`), just
> like the files on disk in the PHP setup. Only `/` runs the random picker.

---

## Make it yours — replace my site info

These files come pre-filled with **my** website information. If you're reusing this
project, replace it with **your own** in every file you publish.

### 1. The `CONFIG` block (URL + brand)

Open each of the four files in a text editor and find the **`CONFIG`** block near the
top of the `<script>` tag (it looks the same in every file):

```js
const CONFIG = {
  duration: 5,                    // how long the boot lasts, in SECONDS
  redirect: "https://vss.dev",    // where the visitor goes at the end  ← CHANGE THIS
  brand: "VSS",                   // brand name shown during the boot    ← CHANGE THIS
  autoRedirect: true,             // true = auto-jump; false = wait for a key/click
  skipAfter: 3                    // seconds until the "Skip →" button appears
};
```

- `redirect` → change `https://vss.dev` to **your** destination URL (keep the quotes,
  include `https://`). Also change it in the `<noscript>` refresh line in the
  `<head>` (`content="3;url=https://vss.dev"`), which is what visitors without
  JavaScript follow.
- `brand` → change `VSS` to **your** name/company (e.g. `"ACME"`). It updates the logo
  text, drive names, hostname, etc., automatically.

### 2. The page title & description (in the `<head>`)

Each file's `<head>` is pre-set to my title/description. Change these to describe
**your** page (see [Make it SEO-friendly](#make-it-seo-friendly-recommended-one-time-edits)
for the full list):

- `<title>` — currently `Victor Santos' Projects & Knowledge Base`
- `<meta name="description">`
- `<meta property="og:title">`
- `<meta property="og:description">`
- `<link rel="canonical">` — set to this page's own address on your domain

> Quick way to find them all: search each file for `vss.dev`, `VSS`, and
> `Victor Santos` and replace with your own values.

Everything else is optional.

---

## What each setting does

| Setting | Default | What it controls |
|---------|---------|------------------|
| `duration` | `5` | Length of the boot animation in **seconds**. Higher = longer show. |
| `redirect` | `https://vss.dev` | Destination URL. **This is the main one to change.** |
| `brand` | `"VSS"` | Brand text shown throughout (logo, OS name, hostname, panel title). |
| `autoRedirect` | `true` | `true`: jumps automatically when the boot ends. `false`: the boot finishes and then waits — the visitor must **press any key or click** the link to continue. |
| `skipAfter` | `3` | Seconds before the **Skip →** button fades in (so people can bypass the wait). Set to `false` to hide the button entirely. |

When `autoRedirect` is on, the Skip button also shows a live countdown:
**`Skip → (auto in 3s)`**.

---

## Overriding settings from the URL (no editing needed)

Every setting except `redirect` can be set with a query string, which is handy for
testing:

```
retro-bios.html?duration=12&brand=ACME&autoRedirect=0&skipAfter=5
```

| Param | Example | Notes |
|-------|---------|-------|
| `duration` | `?duration=12` | Seconds. |
| `brand` | `?brand=ACME` | Brand text. |
| `autoRedirect` | `?autoRedirect=0` | Use `0`/`false`/`no`/`off` to turn it **off**. |
| `skipAfter` | `?skipAfter=5` or `?skipAfter=off` | Seconds, or `off` to hide the Skip button. |

> URL values win over the values written in `CONFIG`, so you don't have to touch the
> file to try different settings.
>
> The destination is deliberately **not** overridable from the URL. Allowing it would
> let anyone craft a link on your domain that sends visitors to any site (an open
> redirect). Set it in `CONFIG` instead.

---

## Make it SEO-friendly (recommended one-time edits)

Each file already includes a title, meta description, Open Graph tags, a heading,
a `<noscript>` fallback, and a **real followable link** to your destination. To get
the most out of it, edit these in the `<head>` of each file you use:

1. **Canonical URL** — fill in the empty tag with this page's own address:
   ```html
   <link rel="canonical" href="https://yourdomain.com/boot.html">
   ```
2. **Title & description** — change `<title>`, `<meta name="description">`, and the
   `og:title` / `og:description` to describe your actual page.
3. The destination link is generated automatically from `redirect`, so once you set
   `redirect` the on-page link and the hidden "If you are not redirected
   automatically, continue to …" link both point to the right place.

**Important reality check:** these pages redirect using JavaScript (client-side).
That's perfect as a branded splash/interstitial, but search engines do **not** pass
ranking credit through a JS/meta-refresh redirect the way they do through a real
server-side `301` redirect. If your goal is SEO link equity (not just a cool
intro), set up a `301` on your server instead. If your goal is a stylish entry
screen for visitors, these are exactly right.

---

## How to use / publish

- **Test locally:** double-click any file to open it in your browser.
- **Use as a landing/splash page:** rename the file (e.g. `index.html`) and upload it
  to your web host. Visitors who land there see the boot, then go to `redirect`.
- **Use random templates (PHP host):** upload all four `.html` files plus
  `index.php` to a PHP-enabled web host, then point visitors to `index.php`.
- **Use random templates (Cloudflare Pages):** deploy the whole folder (the four
  `.html` files plus `functions/index.js`) to Cloudflare Pages — see the
  [Cloudflare Pages](#cloudflare-pages-no-php) section above. Point visitors to `/`.
- **Multiple destinations:** make one copy of the file per destination, each with its
  own `redirect` in `CONFIG`.

---

## FAQ

**The page redirects too fast / too slow.**
Change `duration` (seconds).

**I don't want it to auto-redirect.**
Set `autoRedirect: false`. The boot will finish and wait for a keypress or click.

**I don't want the Skip button.**
Set `skipAfter: false`.

**Why does the random picker show the same animation after refresh?**
It stores the selected template in a cookie for 5 minutes. Change `$cookieLifetime`
in `index.php` (or `COOKIE_LIFETIME` in `functions/index.js`) for a shorter or
longer memory.

**How do I force a different random animation?**
Open `index.php?shuffle=1` (or `/?shuffle=1` on Cloudflare Pages), or clear the
`boot_template` cookie.

**Nothing happens for visitors with JavaScript disabled.**
There's a `<noscript>` fallback that redirects after ~3 seconds, plus a visible
link they can click. You can adjust the delay and destination in the
`<meta http-equiv="refresh" content="3;url=https://vss.dev">` line inside `<noscript>`.

**Can I change the colors/text of the boot lines?**
Yes — everything is inline. The CSS is in the `<style>` block and the boot text is
in the `<script>` (look for the `lines` / `seq` / `events` arrays).
