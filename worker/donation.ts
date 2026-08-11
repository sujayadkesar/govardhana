/**
 * Donation intake handler.
 *
 * This exists so the browser never sees a secret. The old site called a
 * Google Apps Script URL directly from client JavaScript, which meant the
 * endpoint was readable by anyone with DevTools — and would have stayed
 * readable even with a private repository, because the code ships to the
 * visitor either way.
 *
 * Here the Apps Script URL and its shared token live as encrypted Worker
 * secrets. The browser only ever calls /api/donation on our own origin.
 */

export interface Env {
  ASSETS: Fetcher;
  APPS_SCRIPT_URL: string;
  APPS_SCRIPT_TOKEN: string;
  NOTIFY_EMAIL: string;
  RATE_LIMIT?: KVNamespace;
}

type Payload = Record<string, unknown>;

const ALLOWED_ORIGINS = [
  'https://shrigovardhan.org',
  'https://www.shrigovardhan.org',
  'https://govardhanagoshale.govardhangoshale.workers.dev',
];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const str = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.slice(0, max).trim() : '';

type Checked =
  | { ok: true; clean: Payload }
  | { ok: false; why: string };

function validate(kind: string, body: Payload): Checked {
  if (kind !== 'intent' && kind !== 'confirm') return { ok: false, why: 'bad kind' };

  const ref = str(body.ref, 24);
  if (!/^GOV[A-Z0-9]{4,20}$/.test(ref)) return { ok: false, why: 'bad ref' };

  if (kind === 'confirm') {
    const utr = str(body.utr, 24);
    if (utr && !/^\d{6,24}$/.test(utr)) return { ok: false, why: 'bad utr' };
    return { ok: true, clean: { kind, ref, utr: utr || null, cause: str(body.cause, 40) } };
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 1 || amount > 10_000_000) {
    return { ok: false, why: 'bad amount' };
  }

  const name = str(body.name, 80);
  const phone = str(body.phone, 10);
  const email = str(body.email, 120);

  if (name.length < 2) return { ok: false, why: 'bad name' };
  if (!/^[6-9]\d{9}$/.test(phone)) return { ok: false, why: 'bad phone' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, why: 'bad email' };

  // Identification is required on every donation — the trust reports each
  // one in Form 10BD, which needs an identifier against the donor.
  const idType = str(body.idType, 10).toUpperCase();
  const idNumber = str(body.idNumber, 12).toUpperCase();
  const address = str(body.address, 240);

  const validId =
    idType === 'PAN'
      ? /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(idNumber)
      : idType === 'AADHAAR'
        ? /^[2-9][0-9]{11}$/.test(idNumber)
        : false;
  if (!validId) return { ok: false, why: 'bad id' };
  if (address.length < 8) return { ok: false, why: 'bad address' };

  return {
    ok: true,
    clean: {
      kind, ref, amount,
      cause: str(body.cause, 40),
      causeTitle: str(body.causeTitle, 80),
      name, phone, email,
      idType, idNumber, address,
    },
  };
}

/** Per-IP throttle. The old endpoint had none — anyone could flood the sheet. */
async function throttled(env: Env, ip: string): Promise<boolean> {
  if (!env.RATE_LIMIT) return false;
  const key = `rl:${ip}`;
  const n = Number((await env.RATE_LIMIT.get(key)) ?? '0');
  if (n >= 12) return true;
  await env.RATE_LIMIT.put(key, String(n + 1), { expirationTtl: 600 });
  return false;
}

export async function handleDonation(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    // No data is ever returned on GET.
    return json({ error: 'method not allowed' }, 405);
  }

  const origin = request.headers.get('Origin') ?? '';
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return json({ error: 'forbidden' }, 403);
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  if (await throttled(env, ip)) {
    return json({ error: 'too many requests' }, 429);
  }

  let body: Payload;
  try {
    const raw = await request.text();
    if (raw.length > 4096) return json({ error: 'payload too large' }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'bad json' }, 400);
  }

  const result = validate(String(body.kind ?? ''), body);
  if (!result.ok) return json({ error: 'invalid', detail: result.why }, 400);

  if (!env.APPS_SCRIPT_URL || !env.APPS_SCRIPT_TOKEN) {
    return json({ error: 'not configured', detail: 'APPS_SCRIPT_URL / APPS_SCRIPT_TOKEN missing' }, 503);
  }

  let upstream: Response;
  try {
    upstream = await fetch(env.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...result.clean,
        token: env.APPS_SCRIPT_TOKEN, // never leaves the server
        notify: env.NOTIFY_EMAIL,
        receivedAt: new Date().toISOString(),
        ua: request.headers.get('User-Agent')?.slice(0, 200) ?? '',
        country: (request as unknown as { cf?: { country?: string } }).cf?.country ?? '',
      }),
    });
  } catch {
    return json({ error: 'upstream unreachable' }, 502);
  }

  if (!upstream.ok) return json({ error: 'upstream', status: upstream.status }, 502);

  return json({ ok: true, ref: result.clean.ref });
}
