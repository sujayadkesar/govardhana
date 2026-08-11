/**
 * Worker entry point.
 *
 * The site deploys as a Worker with static assets rather than as a classic
 * Pages project, which means the Pages `functions/` directory convention is
 * not picked up — /api/donation returned 404 on the first deployment.
 * Routing it explicitly here fixes that and keeps the whole configuration in
 * the repository, where it cannot be lost in a dashboard.
 *
 * Everything that is not an API route falls through to ASSETS, which serves
 * the built site and honours public/_redirects and the 404 page.
 */
import { handleDonation, type Env } from './donation';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/donation') {
      return handleDonation(request, env);
    }

    // Any other /api/* path is ours and does not exist — answer it here
    // rather than letting it fall through to the 404 HTML page.
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
