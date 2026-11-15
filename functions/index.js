// Cloudflare Pages Function, equivalent of index.php.
// Handles requests to "/" and serves one of the boot templates,
// remembering the choice in a short-lived cookie.

// Template keys; each is the <key>.html file in the static asset bundle.
const TEMPLATES = ['retro-bios', 'linux-terminal', 'modern-glass', 'cyberpunk-matrix'];

const COOKIE_NAME = 'boot_template';
const COOKIE_LIFETIME = 5; // minutes

/**
 * Serves a boot template for "/", picked from ?template, the cookie, or at random.
 * @param {EventContext} context - Pages Function context with the request and ASSETS binding.
 * @returns {Promise<Response>} the template HTML, or a 500 if it cannot be loaded.
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const requested = url.searchParams.get('template') ?? '';
  const cookies = parseCookies(request.headers.get('Cookie') ?? '');
  let selected = cookies[COOKIE_NAME] ?? '';

  if (TEMPLATES.includes(requested)) {
    selected = requested;
  } else if (!TEMPLATES.includes(selected) || url.searchParams.has('shuffle')) {
    selected = TEMPLATES[randomInt(TEMPLATES.length)];
  }

  // Fetch the chosen template from the static asset bundle. Pages answers "/x.html" with a
  // 308 to "/x", so the extensionless path is what returns the file itself.
  const assetUrl = new URL(`/${selected}`, url.origin);
  const asset = await env.ASSETS.fetch(assetUrl);

  if (!asset.ok) {
    return new Response('Selected boot template is unavailable.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
    });
  }

  const headers = new Headers(asset.headers);
  headers.set('Content-Type', 'text/html; charset=UTF-8');
  // The body varies per visitor (random pick + Set-Cookie), so no cache may store or revalidate it.
  headers.set('Cache-Control', 'private, no-store');
  headers.delete('ETag');
  headers.delete('Last-Modified');
  headers.append('Set-Cookie', buildCookie(selected, url.protocol === 'https:'));

  return new Response(asset.body, { status: 200, headers });
}

/**
 * Builds the Set-Cookie value that remembers the chosen template.
 * @param {string} value - a key from TEMPLATES.
 * @param {boolean} secure - true to add the Secure flag (HTTPS requests).
 * @returns {string} the Set-Cookie header value.
 */
function buildCookie(value, secure) {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    `Max-Age=${COOKIE_LIFETIME * 60}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

/**
 * Parses a Cookie header into a name/value map.
 * @param {string} header - the raw Cookie header ('' if absent).
 * @returns {Record<string, string>} decoded cookie values by name.
 */
function parseCookies(header) {
  const out = {};
  for (const pair of header.split(';')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const name = pair.slice(0, idx).trim();
    if (!name) continue;
    const raw = pair.slice(idx + 1).trim();
    // Any cookie on the domain lands here; a malformed %-sequence must not crash the request.
    try {
      out[name] = decodeURIComponent(raw);
    } catch {
      out[name] = raw;
    }
  }
  return out;
}

/**
 * Returns a cryptographically random integer in [0, max).
 * @param {number} max - exclusive upper bound (small, so modulo bias is negligible).
 * @returns {number} the random integer.
 */
function randomInt(max) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}
