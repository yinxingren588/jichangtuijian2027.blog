/**
 * Bing IndexNow 自动批量推送脚本
 * 运行方式: node scripts/submit-indexnow.js
 *
 * 作用: 在运行 `npm run build` 后，自动读取 dist/sitemap-0.xml 中的全部规范 URL
 * 并批量推送至 Bing / IndexNow 集群，实现全站秒级主动提交收录。
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const HOST = 'jichangtuijian2027.blog';
const KEY = 'e9a8f273b1454c5e89d14f2a781290bc';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

function getUrlsFromSitemapOrFallback() {
  const sitemapPath = path.resolve(process.cwd(), 'dist/sitemap-0.xml');
  if (fs.existsSync(sitemapPath)) {
    const xml = fs.readFileSync(sitemapPath, 'utf8');
    const locs = [...xml.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map((m) => m[1]);
    if (locs.length > 0) return [...new Set(locs)];
  }
  return [
    `https://${HOST}/`,
    `https://${HOST}/ranking`,
    `https://${HOST}/comparison`,
    `https://${HOST}/lines`,
    `https://${HOST}/carriers`,
    `https://${HOST}/guide`,
    `https://${HOST}/clients`,
    `https://${HOST}/faq`,
    `https://${HOST}/posts`,
  ];
}

const URL_LIST = getUrlsFromSitemapOrFallback();

const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: URL_LIST,
});

const options = {
  hostname: 'api.indexnow.org',
  port: 443,
  path: '/indexnow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  },
};

console.log(`[IndexNow] 正在向 Bing IndexNow 集群推送 ${URL_LIST.length} 个全站 URL...`);

const req = https.request(options, (res) => {
  console.log(`[IndexNow] 响应状态码: ${res.statusCode} ${res.statusMessage}`);
  if (res.statusCode === 200 || res.statusCode === 202) {
    console.log('✅ 成功！Bing 已接收推送请求，正在调度爬虫进行即时抓取！');
  } else {
    console.log(`[IndexNow] 状态: ${res.statusCode}`);
  }
  res.on('data', (d) => process.stdout.write(d));
});

req.on('error', (e) => {
  console.error(`❌ 推送失败，网络异常: ${e.message}`);
});

req.write(payload);
req.end();
