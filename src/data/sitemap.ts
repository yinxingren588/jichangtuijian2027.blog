import { AIRPORT_LIST } from './airports';
import { SITE_CONFIG } from './site';

export interface SitemapCorePage {
  path: string;
  title: string;
  tag: string;
  description: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

export const CORE_SITEMAP_PAGES: SitemapCorePage[] = [
  {
    path: '/',
    title: '博客首页（2027机场推荐综合总览）',
    tag: '首页',
    description: '2027机场推荐核心主站，汇集年度环境速报、30秒按需速配、精选榜单与快速对比',
    changefreq: 'daily',
    priority: '1.0',
  },
  {
    path: '/ranking',
    title: '2027机场推荐完整实力排行榜',
    tag: '榜单',
    description: '35 家实测收录品牌全量图文测评卡片，支持按专线、性价比、电竞与按量分类筛选',
    changefreq: 'daily',
    priority: '0.9',
  },
  {
    path: '/comparison',
    title: '35 家机场核心参数全景对比矩阵',
    tag: '矩阵',
    description: '价格门槛、流量规格、峰值带宽、在线率、核心优势与优惠码一表横向筛选比对',
    changefreq: 'daily',
    priority: '0.9',
  },
  {
    path: '/lines',
    title: '2027 主流线路架构与加密协议横评',
    tag: '原理',
    description: 'IPLC / IEPL 内网物理专线 vs BGP 隧道 vs 公网直连，以及五大现代加密协议解析',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    path: '/carriers',
    title: '中国电信 / 联通 / 移动三网宽带适配指南',
    tag: '三网',
    description: '电信 163、联通 169、移动 CMI 国际出口差异分析及分地区低延迟节点选择建议',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    path: '/guide',
    title: '2027 科学上网机场选购指南与防跑路原则',
    tag: '避坑',
    description: '四大应用场景精准推荐、买前六大防跑路铁律与五维量化评测打分权重',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    path: '/clients',
    title: '全平台代理客户端推荐与配置教程',
    tag: '教程',
    description: 'Windows、macOS、iOS（小火箭）与 Android 客户端上手及常见报错排查',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    path: '/posts',
    title: '2027 机场深度测评与科学上网技术专栏',
    tag: '专栏',
    description: '汇总 6 篇深度测评长文、Clash/Sing-box 上手教程与 ChatGPT 防封实操指南',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    path: '/faq',
    title: '常见问题百科全书（60 条实战问答）',
    tag: 'FAQ',
    description: '覆盖 7 大专题 60 条高频疑问，支持实时关键词搜索、分类筛选与全部展开',
    changefreq: 'daily',
    priority: '0.85',
  },
  {
    path: '/sitemap',
    title: '全站 HTML 网站地图（内容总索引）',
    tag: '索引',
    description: '一页速览全站所有专题页、35 家品牌详情页、测评文章及 60 条 FAQ 快捷目录',
    changefreq: 'weekly',
    priority: '0.6',
  },
];

export interface PostSitemapEntry {
  slug: string;
  path: string;
  title: string;
  category: string;
  description: string;
  lastmod: string;
}

const postModules = Object.values(
  import.meta.glob('../content/posts/*.md', { eager: true })
) as any[];

export const POST_SITEMAP_ENTRIES: PostSitemapEntry[] = postModules
  .map((post) => {
    const slug = (post.file as string).split(/[/\\]/).pop()!.replace(/\.md$/, '');
    const pubDate = post.frontmatter?.updatedDate || post.frontmatter?.pubDate || '2026-11-25';
    return {
      slug,
      path: `/posts/${slug}`,
      title: post.frontmatter?.title || slug,
      category: post.frontmatter?.category || '深度评测',
      description: post.frontmatter?.description || '',
      lastmod: new Date(pubDate).toISOString(),
    };
  })
  .sort((a, b) => b.lastmod.localeCompare(a.lastmod));

export interface XmlUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

export function buildAllXmlUrls(): XmlUrlEntry[] {
  const nowIso = new Date().toISOString();
  const base = SITE_CONFIG.url.replace(/\/$/, '');

  const coreUrls: XmlUrlEntry[] = CORE_SITEMAP_PAGES.map((p) => ({
    loc: p.path === '/' ? `${base}/` : `${base}${p.path}`,
    lastmod: nowIso,
    changefreq: p.changefreq,
    priority: p.priority,
  }));

  const airportUrls: XmlUrlEntry[] = AIRPORT_LIST.map((a) => ({
    loc: `${base}/airports/${a.id}`,
    lastmod: nowIso,
    changefreq: 'daily',
    priority: a.rank <= 5 ? '0.9' : '0.85',
  }));

  const postUrls: XmlUrlEntry[] = POST_SITEMAP_ENTRIES.map((p) => ({
    loc: `${base}${p.path}`,
    lastmod: p.lastmod,
    changefreq: 'weekly',
    priority: '0.85',
  }));

  return [...coreUrls, ...airportUrls, ...postUrls];
}
