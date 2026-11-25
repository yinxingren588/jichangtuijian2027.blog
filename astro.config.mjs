// @ts-check
import { defineConfig } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://jichangtuijian2027.blog',
  trailingSlash: 'never',
  server: {
    port: 8027,
    host: true,
    allowedHosts: true,
  },
  integrations: [
    sitemap({
      changefreq: ChangeFreqEnum.DAILY,
      priority: 0.8,
      lastmod: new Date(),
      filter: (page) => !page.endsWith('/sitemap.xml'),
      serialize: (item) => {
        const pathname = new URL(item.url).pathname;
        if (pathname === '/') {
          return { ...item, changefreq: ChangeFreqEnum.DAILY, priority: 1.0 };
        }
        if (pathname === '/ranking' || pathname === '/comparison') {
          return { ...item, changefreq: ChangeFreqEnum.DAILY, priority: 0.9 };
        }
        if (pathname === '/faq' || pathname.startsWith('/airports/') || pathname.startsWith('/posts/')) {
          return { ...item, changefreq: ChangeFreqEnum.DAILY, priority: 0.85 };
        }
        if (pathname === '/sitemap') {
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.6 };
        }
        return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.8 };
      },
    }),
  ],
});
