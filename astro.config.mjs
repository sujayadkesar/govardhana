// @ts-check
import { defineConfig } from 'astro/config';

// Static output: every page is pre-rendered HTML. The only server-side code is
// the Cloudflare Pages Function in functions/, which Cloudflare picks up
// automatically and which never goes through the Astro build.
export default defineConfig({
  site: 'https://shrigovardhan.org',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // Emit /goseva/adopt-a-cow/index.html so existing shared links keep working
    // with or without the trailing slash.
    format: 'directory',
  },
  vite: {
    build: {
      // Donation pages must work on poor rural connections; keep chunks small
      // rather than bundling one large file.
      assetsInlineLimit: 2048,
    },
  },
});
