// Cloudflare Pages Function — equivalent of index.php.
// Handles requests to "/" and serves one of the boot templates,
// remembering the choice in a short-lived cookie.

const templates = {
  'retro-bios': '/retro-bios.html',
  'linux-terminal': '/linux-terminal.html',
  'modern-glass': '/modern-glass.html',
  'cyberpunk-matrix': '/cyberpunk-matrix.html',
};

const COOKIE_NAME = 'boot_template';
const COOKIE_LIFETIME = 5; // minutes

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const keys = Object.keys(templates);

  const requested = url.searchParams.get('template') ?? '';
  const cookies = parseCookies(request.headers.get('Cookie') ?? '');
  let selected = cookies[COOKIE_NAME] ?? '';

  if (Object.prototype.hasOwnProperty.call(templates, requested)) {
    selected = requested;
  } else if (
    !Object.prototype.hasOwnProperty.call(templates, selected) ||
    url.searchParams.has('shuffle')
  ) {
    selected = keys[randomInt(keys.length)];
  }

  // Fetch the chosen template from the static asset bundle.
  const assetUrl = new URL(templates[selected], url.origin);
  const asset = await env.ASSETS.fetch(assetUrl);

  if (!asset.ok) {
    return new Response('Selected boot template is unavailable.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
    });
  }

  const headers = new Headers(asset.headers);
  headers.set('Content-Type', 'text/html; charset=UTF-8');
  headers.append('Set-Cookie', buildCookie(selected, url.protocol === 'https:'));

  return new Response(asset.body, { status: 200, headers });
}

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

function parseCookies(header) {
  const out = {};
  for (const pair of header.split(';')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const name = pair.slice(0, idx).trim();
    if (name) out[name] = decodeURIComponent(pair.slice(idx + 1).trim());
  }
  return out;
}

function randomInt(max) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}
