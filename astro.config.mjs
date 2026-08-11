// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Local stand-in for the Cloudflare Pages Function.
 *
 * In production Cloudflare serves functions/api/donation.ts, which holds the
 * Apps Script URL and shared token as encrypted environment variables. That
 * function does not run under `astro dev`, so without this the donation form
 * fails locally with "we couldn't save your details".
 *
 * This lives in the Vite dev server only — it is not part of the build, so it
 * can never shadow the real function in production.
 */
function devDonationApi() {
  return {
    name: 'dev-donation-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/donation', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'method not allowed' }));
          return;
        }
        let raw = '';
        req.on('data', (c) => { raw += c; });
        req.on('end', () => {
          let body = {};
          try { body = JSON.parse(raw); } catch {}
          console.log('\n[33m[dev] /api/donation[0m',
            JSON.stringify(body, null, 2), '\n');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, ref: body.ref, dev: true }));
        });
      });
    },
  };
}

export default defineConfig({
  site: 'https://shrigovardhan.org',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // Emit /goseva/adopt-a-cow/index.html so shared links keep working with
    // or without a trailing slash.
    format: 'directory',
  },
  vite: {
    plugins: [devDonationApi()],
    build: {
      // Donation pages must work on poor rural connections; keep chunks small.
      assetsInlineLimit: 2048,
    },
  },
});
