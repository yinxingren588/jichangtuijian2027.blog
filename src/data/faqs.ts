export type FaqCategoryId =
  | 'selection'
  | 'network'
  | 'speed'
  | 'ai-streaming'
  | 'clients'
  | 'billing-security'
  | 'troubleshooting';

export interface FaqCategoryMeta {
  id: FaqCategoryId;
  label: string;
  icon: string;
  description: string;
}

export interface FaqItem {
  id: string;
  category: FaqCategoryId;
  question: string;
  answer: string;
  keywords?: string[];
  featured?: boolean;
}

export const FAQ_CATEGORIES: FaqCategoryMeta[] = [
  {
    id: 'selection',
    label: '选型与防跑路',
    icon: '🛡️',
    description: '如何挑选靠谱服务商、识别低价陷阱与避免跑路',
  },
  {
    id: 'network',
    label: 'IPLC专线与协议',
    icon: '⚡',
    description: 'IPLC/IEPL专线、Hysteria 2、VLESS-Reality与IP类型科普',
  },
  {
    id: 'speed',
    label: '三网宽带与调优',
    icon: '📶',
    description: '电信/联通/移动宽带适配、晚高峰拥堵与分流提速',
  },
  {
    id: 'ai-streaming',
    label: 'AI与流媒体解锁',
    icon: '🤖',
    description: 'ChatGPT/Claude风控防封、Netflix/TikTok原生解锁',
  },
  {
    id: 'clients',
    label: '客户端与订阅',
    icon: '📱',
    description: 'Clash Verge Rev、Sing-box、Shadowrocket下载配置排错',
  },
  {
    id: 'billing-security',
    label: '计费多设备与隐私',
    icon: '💳',
    description: '并发设备限制、流量结算、支付安全与无日志审计规则',
  },
  {
    id: 'troubleshooting',
    label: '榜单实测与排错',
    icon: '🔧',
    description: '断连红字排查、外服游戏加速与2027榜单品牌挑选建议',
  },
];

const CATEGORY_LABEL_MAP: Record<FaqCategoryId, string> = {
  'selection': '选型与防跑路',
  'network': 'IPLC专线与协议',
  'speed': '三网宽带与调优',
  'ai-streaming': 'AI与流媒体解锁',
  'clients': '客户端与订阅',
  'billing-security': '计费多设备与隐私',
  'troubleshooting': '榜单实测与排错',
};

export function getFaqCategoryLabel(category: FaqCategoryId): string {
  return CATEGORY_LABEL_MAP[category];
}

/**
 * 将包含轻量 Markdown 标记（**加粗**、`行内代码`、列表项）的 FAQ 文本转为纯净文本，用于 Schema.org JSON-LD。
 */
export function faqToPlainText(markdown: string): string {
  return markdown
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInlineMarkdown(escapedLine: string): string {
  return escapedLine
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/**
 * 在构建时安全地将 FAQ 答案中的轻量 Markdown 转换为结构化 HTML（无 XSS 风险）。
 */
export function formatFaqAnswerHtml(markdown: string): string {
  const lines = markdown.trim().split(/\r?\n/);
  const blocks: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (!listType || listItems.length === 0) return;
    blocks.push(`<${listType}>${listItems.map((item) => `<li>${item}</li>`).join('')}</${listType}>`);
    listType = null;
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    const olMatch = line.match(/^\d+\.\s+(.*)$/);

    if (ulMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(formatInlineMarkdown(escapeHtml(ulMatch[1])));
      continue;
    }

    if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(formatInlineMarkdown(escapeHtml(olMatch[1])));
      continue;
    }

    flushList();
    blocks.push(`<p>${formatInlineMarkdown(escapeHtml(line))}</p>`);
  }

  flushList();
  return blocks.join('');
}

export const FAQS: FaqItem[] = [
  // ==================== 1. 选型与防跑路 (9条) ====================
  {
    id: 'faq-01',
    category: 'selection',
    featured: true,
    question: '2027年选择科学上网机场，首选哪种类型的线路？',
    answer:
      '强烈推荐优先选择拥有 **IPLC（国际私有租用线路）或 IEPL（国际以太网专线）** 的企业级专线机场（如榜单前列 **隐形人**、**暮光加速**、**微风网络 Breezenet**、**大佬云**）。专线传输在物理层面完全不过 GFW 公网审查节点，因此具备极高的抗封锁能力与近乎为零的晚高峰丢包率。虽然月费比普通中继略高几元，但在稳定性、低延迟以及敏感时期的可用性方面具有绝对优势。',
    keywords: ['IPLC', 'IEPL', '专线', '稳定', '2027机场推荐'],
  },
  {
    id: 'faq-02',
    category: 'selection',
    featured: true,
    question: '为什么极力建议大家“尽量按月付费”，警惕超低价年付或永久套餐？',
    answer:
      '在科学上网圈，最常见的“跑路”套路就是商家以违背服务器成本的超低价格（例如 39 元永久、99 元三年无限流量）吸引大量用户囤单，随后因跨境专线成本不堪重负或恶意卷款关站。\n购买铁律如下：\n1. 新入手任何一家机场，**前 1-2 个月务必优先按月付款或按季付款**；\n2. 实测确认其晚高峰 20:00–23:00 速率与工单客服响应稳定后，再考虑半年付或年付优惠；\n3. 遇到“永久会员”“无限流量不限速仅几元”的宣传可直接划走避坑。',
    keywords: ['跑路', '按月付费', '年付', '永久套餐', '避坑'],
  },
  {
    id: 'faq-03',
    category: 'selection',
    featured: true,
    question: '如何识别“贴牌跑路盘”与真正靠谱的自建运维机场？',
    answer:
      '可通过以下 5 个实战维度快速鉴别：\n- **域名与建站历史**：老牌口碑机场（如微风网络、唯兔云等）域名与 TG 公告频道往往拥有多年公开运行记录，而非全网搜不到任何评价的全新临时域；\n- **节点结构真实度**：靠谱机场的地区节点会如实标注入口（如深港/沪日专线）和落地机类型，而贴牌盘往往堆砌大量无效重复假节点；\n- **客服与工单体系**：正规机场面板配备工单系统或维护公告频道，节点遇风控能在数小时内切换修复；\n- **计费合理性**：专线成本极高，单价通常在 18–35 元/月左右，性价比中继在 10–16 元/月左右；\n- **支持月付试错**：拒绝只开放年付购买的霸王条款机场。',
    keywords: ['贴牌机场', '老牌机场', '鉴别', '防跑路'],
  },
  {
    id: 'faq-04',
    category: 'selection',
    question: '2027年买机场，“平价公网中继”和“高端IPLC专线”的真实体验差距多大？',
    answer:
      '核心差距不在白天而在**晚高峰（20:00–23:00）与特殊时期**：\n- **白天闲时**：两者都能轻松跑出几百兆，刷网页、看 YouTube 4K 体感几乎一致；\n- **晚高峰时段**：普通公网中继（如 10-15 元挡位）依赖国内运营商国际出口，电信用户容易遭遇跨网拥堵或抖动；而纯 **IPLC/IEPL 专线**走独立物理通道，晚高峰速率衰减通常低于 5%，4K/8K 进度条随便拖、外服游戏不跳 ping；\n- **建议**：学生轻度查阅资料可选 **梯子云**、**U1S1**、**榴莲云** 等高性价比中继；外贸办公、AI 重度开发者或对断线零容忍人群务必直接上专线旗舰。',
    keywords: ['中继', '专线', '区别', '晚高峰', '性价比'],
  },
  {
    id: 'faq-05',
    category: 'selection',
    featured: true,
    question: '预算有限（每月6-15元左右）的学生党，有哪些高性价比专线机场推荐？',
    answer:
      '如果您追求低门槛且不愿妥协专线质量，推荐从以下几家实测高性价比方案挑选（全部支持 1.0x 真实计费且可用券）：\n- **边缘节点 EdgeNova**：月付仅 ¥15.00（120GB/月），优惠券 `xk808` 享 8 折，年付小包折合约 ¥6.53/月；\n- **无忧链接 / 唯兔云（V2云）**：均搭载全 IPLC 物理专线，年付小包低至 ¥79/年（折合 ¥6.58/月）与 ¥6.66/月，分别可使用优惠码 `wuyou666` 和 `v2yun`；\n- **飞猫云**：学生年付版低至 ¥84/年（50GB/月，折合 ¥7.00/月），9 折优惠码 `flycat888`；\n- **隐形人（榜首机皇）**：星耀风暴年付（80GB/月）用 8 折券 `yxr888` 后仅 ¥87.20/年（折合 ¥7.27/月），白银月付 144GB 券后 ¥19.20/月；\n- **榴莲云 / 速界 SuJie / 快狸 KuaiLi / 可信云**：均 ¥15.00/月起，支持多周期阶梯折扣。',
    keywords: ['便宜机场', '学生党', '性价比', '年付特惠'],
  },
  {
    id: 'faq-06',
    category: 'selection',
    featured: true,
    question: '不常翻墙，只是偶尔查资料或应急备用，买哪种机场套餐最划算？',
    answer:
      '推荐选择**不限时一次性买断（流量永不过期）**的机场流量包！本站收录的多家专线机场均配备永久有效方案：\n- **光速云 LightSpeed**：提供 247GB 永久有效买断包（¥147，优惠码 `gsy888`）；\n- **微风网络 Breezenet**：提供 270GB / ¥200 与 570GB / ¥370 永久包；\n- **隐形人**：提供 160GB（券后 ¥183.20）、420GB（券后 ¥439.20）与 1.0TB（券后 ¥959.20）商旅买断包；\n- **暮光加速 / 榴莲云 / 闪电鼠 / 环球梯 / 云界线 / 极连云 / Sogo云**：亦均提供 50GB–1.0TB 永久不过期买断方案，买一次用完为止，非常适合低频刚需或应急防失联。',
    keywords: ['按量付费', '不限时', '永久买断', '备用机场', '偶尔用'],
  },
  {
    id: 'faq-07',
    category: 'selection',
    question: '为什么资深用户都建议“主力专线 + 备用按量”双机场组合？',
    answer:
      '没有任何一家云服务商能保证 100% 绝对不被上游机房波及或遭遇突发海底光缆维修。哪怕是年费上千的机场，在遇到极端网络事件或订阅域名临时更换时，如果没有备用节点，你可能连打开官网获取新订阅网址都做不到。\n花 30 元买一个不限时按量机场（如 **跨界云** 或 **环球梯**）导入客户端备用，关键时刻能救命——既能查官网最新公告，又不耽误紧急工作与视频会议。',
    keywords: ['双机场', '备用', '防失联', '容灾'],
  },
  {
    id: 'faq-08',
    category: 'selection',
    question: '一线大牌高价机场和中小口碑新锐机场怎么选？越贵就一定越好吗？',
    answer:
      '并非越贵越好，但一分钱一分货主要体现在**线路冗余度和抗拥堵余量**：\n- **超大型老牌高价机场**用户基数大，有时节点容易因万人共抢触发 ChatGPT/Google 人机验证或流媒体风控，且部分大机场存在较高门槛或强制季付；\n- **中等规模口碑专线机场**（如榜单前列的隐形人、暮光加速、微风网络、大佬云、飞猫云）往往带宽冗余充足、住宅 IP 更干净、支持灵活月付且有专属优惠码；\n建议结合自己的宽带运营商（电信/联通/移动）与核心用途（AI/追剧/游戏）按月实测对比。',
    keywords: ['高价机场', '老牌', '选购策略'],
  },
  {
    id: 'faq-09',
    category: 'selection',
    question: '机场面板和节点后面的“倍率”（如 `1x`、`0.5x`、`2x`、`3x`）是什么意思？',
    answer:
      '流量倍率决定了使用该节点时实际扣除的套餐流量比例：\n- **`1x`（标准倍率）**：实际消耗 1GB，后台扣除 1GB 流量，最常见于日常主力节点；\n- **`0.1x – 0.5x`（低倍率/省流节点）**：看 4K 视频消耗 10GB，只扣 1–5GB，多见于日本、美国或下载专用节点；\n- **`2x – 5x`（高倍率专线/家宽节点）**：消耗 1GB 扣除 2–5GB，常见于极稀缺的昂贵 IPLC 专线或真实双 ISP 家宽原生 IP 节点。\n使用客户端前建议先看清节点名称后方的倍率标注，避免挂着高倍率节点下载大型游戏包导致流量快速耗尽。',
    keywords: ['流量倍率', '1x', '2x', '0.5x', '扣流量'],
  },

  // ==================== 2. IPLC专线与协议技术 (9条) ====================
  {
    id: 'faq-10',
    category: 'network',
    featured: true,
    question: '为什么2027年越来越多机场推荐支持 Hysteria 2 和 VLESS-Reality 协议？',
    answer:
      '进入 2027 年，GFW 对传统明文 TLS 和未混淆特征流量的识别封锁算法愈发智能化：\n- **Hysteria 2**：基于深度调优的 QUIC（UDP）传输架构，自带暴力定制拥塞控制算法，专治弱网环境与运营商恶意 QoS 限速，即使在 20%-30% 高丢包环境下依然能够强行拉满宽带速率；\n- **VLESS-Reality**：直接借用海外真实主流大厂网站的 TLS 证书与握手指纹进行端到端伪装，无需自己购买域名证书且完美抵御“主动探测（Active Probing）”，隐匿性极强。',
    keywords: ['Hysteria 2', 'VLESS-Reality', '协议', '抗封锁'],
  },
  {
    id: 'faq-11',
    category: 'network',
    question: '什么是 IPLC、IEPL 和普通 BGP 中转（隧道中继）？各自优缺点是什么？',
    answer:
      '三者是国内科学上网节点最核心的传输架构层级：\n- **IPLC / IEPL（国际内网专线）**：运营商或大型机房合规租用的点对点物理/以太网跨境专线，国内入口机房直接内网直连香港/日本落地，**物理层面完全绕开公网防火墙**，延迟极低（20–35ms）、晚高峰几乎零丢包，代表品牌：**隐形人、暮光加速、微风网络、大佬云**；\n- **BGP 多线隧道中继**：利用国内三网优化机房作为入口跳板，通过加密隧道中转至海外落地，抗封锁能力强于直连且成本更亲民，但跨境段仍走公网海底光缆，晚高峰受大环境国际出口影响略大；\n- **普通直连机场**：本地电脑直接连海外 VPS，在 2027 年已极易被阻断且电信/移动延迟极高，不建议作为主力购买。',
    keywords: ['IPLC', 'IEPL', 'BGP中转', '直连', '原理'],
  },
  {
    id: 'faq-12',
    category: 'network',
    question: 'Shadowsocks (SS)、Trojan、VMess、VLESS、Hysteria 2 该如何挑选？',
    answer:
      '如果在客户端里看到同一地区有多种协议节点，建议按以下优先级挑选：\n1. **专线上跑的 Shadowsocks-2022 / Trojan**：在 IPLC/IEPL 内网专线上最常见，因为专线不过墙，SS 和 Trojan 加解密极轻量、延迟最低、省电且全客户端通用；\n2. **VLESS-Reality**：若使用公网直连或中继抗审查，优先选 Reality，稳如磐石；\n3. **Hysteria 2**：在移动宽带、校园网、高铁热点或打外服游戏需要弱网高吞吐时首选（如 **飞V**、**闪电鼠**、**闪跃 FlashLeap**）；\n4. **VMess**：经典协议，配合 WebSocket+TLS 在中继网络上兼容性好，但性能与指纹隐匿不如新一代协议。',
    keywords: ['Shadowsocks', 'Trojan', 'VMess', 'Hysteria2', '协议对比'],
  },
  {
    id: 'faq-13',
    category: 'network',
    question: '为什么 2027 年很多机场和客户端不再默认推荐 SSR（ShadowsocksR）？',
    answer:
      'SSR 协议早已停止维护多年，其握手特征和流量模式在现代深度包检测（DPI）面前几乎等同于“裸奔”，极易触发服务器 IP 端口精准阻断；同时新版 **Clash Meta (mihomo)** 和 **Sing-box** 内核重点围绕 Trojan、SS-2022、VLESS-Reality 和 Hysteria 2 优化。因此 2027 年选购机场应认准支持现代化内核协议的服务商。',
    keywords: ['SSR', 'ShadowsocksR', '协议淘汰', '安全'],
  },
  {
    id: 'faq-14',
    category: 'network',
    question: '什么是“入口服务器”与“落地机”？为什么“多入口负载均衡”很重要？',
    answer:
      '以国内某香港专线节点为例：\n- **入口服务器（Entry）**：位于国内深圳、广州、上海等地的国内机房 IP，负责接收你电脑/手机发出的加密流量；\n- **落地机（Landing/Exit）**：位于香港、日本、美国、新加坡的海外机房，负责真正替你访问目标网站并返回内容。\n优质机场（如 **飞猫云**、**灵动云**、**极连云**）会为同一地区配置**电信、联通、移动三网多地 BGP 入口**，就算某地机房临时维护或遭到运营商割接，也会自动无缝切换至备用入口，保障全天不断网。',
    keywords: ['入口', '落地机', '负载均衡', '多入口BGP'],
  },
  {
    id: 'faq-15',
    category: 'network',
    featured: true,
    question: '什么是“纯净住宅 IP”？和普通机房 IDC IP 有什么本质区别？',
    answer:
      '海外目标网站会根据 IP 所属 ASN 编号判定访客身份：\n- **普通机房 IP（IDC / Data Center IP）**：来自 AWS、GCP、Azure、Vultr 等云厂商机房，由于成千上万代理用户共享，常被 Cloudflare、OpenAI、TikTok、PayPal、Amazon 标记为“高风险数据中心流量”，易出验证码或直接拒访；\n- **纯净住宅 IP（Residential / ISP IP）**：由 AT&T、Comcast、HKT、NTT 等真实居民宽带运营商分配，网站识别为当地真实家庭用户。\n做跨境电商（TikTok Shop、Shopify）、海外收款及高频使用 **ChatGPT / Claude** 的用户，强烈建议挑选拥有纯净住宅 IP 池的机场（如 **微风网络**、**浪网 WaveNet**、**暮光加速**）。',
    keywords: ['住宅IP', '家宽IP', 'IDC IP', '风控', '外贸'],
  },
  {
    id: 'faq-16',
    category: 'network',
    question: '节点名称上的 `CN2 GIA`、`CMIN2`、`AS9929`、`SoftBank` 分别是什么意思？',
    answer:
      '这些是国内三大运营商与海外直连的高端精品网络路由：\n- **CN2 GIA（AS4809）**：中国电信最高级别国际精品网，晚高峰依然极稳不丢包；\n- **AS9929（联通精品网/CUII）**：中国联通高端商用线路，对标电信 CN2 GIA，延迟低且拥堵率极低；\n- **CMIN2（AS58807）**：中国移动新一代高端国际精品路由，极大改善移动出国慢的问题；\n- **SoftBank（日本软银）/ IIJ**：对国内联通和北方宽带极为友好的日本运营商线路。\n如果是高端 **IPLC/IEPL 内网专线**，则根本不需要走公网 CN2/9929，稳定度比高端公网路由还要高出一个维度。',
    keywords: ['CN2 GIA', 'CMIN2', 'AS9929', 'SoftBank', '路由'],
  },
  {
    id: 'faq-17',
    category: 'network',
    question: '什么是 UDP 转发和 Full-Cone NAT？玩外服游戏为什么必须看这个指标？',
    answer:
      '网页浏览主要走 TCP 协议，而 **CS2、APEX、Valorant、Switch 联机、Discord 语音、Telegram 语音/视频通话** 高度依赖 **UDP 数据包**。\n如果机场后端未开启完整的 **UDP 转发** 或 NAT 类型过于严格（Symmetric NAT），游戏里就会频繁出现“连接大厅超时”“能听见说话但打不开麦”或人物瞬移。在榜单中的电竞专精类机场（如 **飞V**、**闪跃 FlashLeap**、**闪电鼠**、**边缘节点 EdgeNova**）中，均默认对全节点开启完整 UDP 与低抖动转发优化。',
    keywords: ['UDP', 'NAT', '游戏加速', 'Switch联机', 'Discord'],
  },
  {
    id: 'faq-18',
    category: 'network',
    question: '节点常用的“DNS 流媒体解锁”和“原生落地解锁”有什么差别？',
    answer:
      '- **原生 IP 解锁（Native Unlock）**：该节点出口服务器本身的 IP 就被 Netflix、Disney+、OpenAI 识别为当地真实 IP，延迟最低、画质缓冲最快且极难突发失效；\n- **DNS 分流解锁（Unlock via DNS Proxy）**：节点本身机房 IP 无法解锁（例如普通香港阿里云机房），机场主在后端将 Netflix/OpenAI 流量通过专用 DNS/Sniproxy 转发至解锁机。\n只要维护得当，两种方式都能看剧用 AI；但如果是跨境账号养号、电商防关联或对 8K 视频秒开要求极高，**原生 IP 节点（Native）** 表现更稳健。',
    keywords: ['DNS解锁', '原生IP', '流媒体解锁', '区分'],
  },

  // ==================== 3. 三网宽带与网速调优 (9条) ====================
  {
    id: 'faq-19',
    category: 'speed',
    featured: true,
    question: '中国移动、中国联通、中国电信宽带用户，选购机场有什么差异？',
    answer:
      '三大运营商国际出口与 QoS 策略差异很大：\n- **中国电信（163骨干网）**：普通公网出国在晚高峰拥堵极其严重，直连或劣质中继必卡。**电信用户强烈推荐直接上 IPLC/IEPL 纯专线机场**（如隐形人、暮光加速、大佬云），物理层避开 163 拥堵出口；\n- **中国联通（169骨干网）**：国内普通家庭宽带中对海外路由最友好，尤其日本、德国、新加坡中继表现优良，性价比机场也能跑出不错成绩；\n- **中国移动（CMI出口）**：移动国际出口大但极易对跨国长连接实施 UDP/TCP 限速（QoS）及墙中墙阻断。移动用户建议优选具备**本地移动入口 BGP 专线或 Hysteria 2 协议**的机场（如飞V、极连云、飞猫云）。',
    keywords: ['电信', '联通', '移动', '宽带区别', '三网适配'],
  },
  {
    id: 'faq-20',
    category: 'speed',
    question: '为什么白天测速几百兆，一到晚上 20:00–23:00 就卡成 PPT？',
    answer:
      '原因主要来自两个方面：\n1. **国际出口公网晚高峰拥堵**：晚 8 点至 11 点全国家庭宽带并发出海流量激增，普通中转线路如果租用廉价公网带宽，会遭遇严重的 15%–40% 丢包与排队抖动；\n2. **机场共享母鸡超售**：部分低价小机场把上千用户塞进一台限速 VPS，白天在线人少速度飞快，晚上同时看视频时单机上行带宽瞬间被抢光。\n**解决办法**：优先选择明确承诺“独享企业专线冗余”且榜单实测晚高峰衰减率低于 5% 的专线机场。',
    keywords: ['晚高峰卡顿', '白天快晚上慢', '掉速', '超售'],
  },
  {
    id: 'faq-21',
    category: 'speed',
    question: '为什么节点 Ping 延迟显示只有 25ms，但实际加载图片和视频还是转圈？',
    answer:
      '延迟（Ping/Latency）与带宽吞吐（Throughput/Speed）是两个完全不同的指标：\n- **延迟低**代表节点国内入口离你物理距离近（例如你在广州连深圳入口只需 15ms），但不代表后面的跨境路段快；\n- **实际加载慢**通常是因为该节点与海外落地之间存在丢包、落地机上游网卡限速、或者运营商对特定端口实施了单线程限速。\n选购机场不能只看客户端测出来的“几十毫秒绿色数字”，更要实测 **YouTube 4K 实时连接速度（Stats for nerds 里的 Connection Speed）** 和单线程测速。',
    keywords: ['延迟低但网速慢', 'Ping', 'Connection Speed', '单线程'],
  },
  {
    id: 'faq-22',
    category: 'speed',
    question: '为什么手机用流量连机场很快，家里电脑连 Wi-Fi 反而很慢（或相反）？',
    answer:
      '这通常是由于**运营商跨网路由不同**与**客户端模式差异**导致：\n- 手机 5G 是移动/联通网络，而家里宽带是电信网络，同一节点在两家运营商走的路径不同，可以换个标注了对应运营商入口（如“电信入口”“多线BGP”）的节点测试；\n- 如果电脑通过旧版老旧路由器 Wi-Fi 连接，或网卡开启了“节能以太网/旧版代理工具残留冲突”，也会严重拖慢单线程速率；\n- 电脑端建议关闭不必要的杀毒软件流量扫描（例如部分安全卫士会对 HTTPS/本地代理端口做深度检测导致掉速）。',
    keywords: ['手机快电脑慢', 'WiFi慢', '5G快', '路由'],
  },
  {
    id: 'faq-23',
    category: 'speed',
    question: '大学校园网、公司内网或酒店 Wi-Fi 环境下经常连不上节点怎么办？',
    answer:
      '校园网与企业防火墙常采用深层包过滤、UDP 限流、甚至屏蔽非 80/443 非常规端口：\n1. **优先切换为 443 端口的 Trojan 或 VLESS-Reality 节点**，伪装成正常访问海外 HTTPS 网站，穿透企业网关能力最强；\n2. 若校园网仅对 UDP 限速不严但限流 TCP，可尝试 **Hysteria 2**（如 **闪电鼠**、**飞V**）暴力穿透；\n3. 检查客户端是否开启了 **TUN（虚拟网卡）模式**，部分校园客户端登录认证需在开启代理前完成。',
    keywords: ['校园网', '公司内网', '酒店WiFi', '连不上'],
  },
  {
    id: 'faq-24',
    category: 'speed',
    question: '挂着机场后发现淘宝、微信、B站、百度等国内网站打不开或变慢怎么办？',
    answer:
      '这几乎 100% 是因为客户端误开成了**“全局模式（Global）”**！全局模式下，连微信、淘宝图片都会先绕道香港/美国一圈再回到国内，不仅国内网站卡爆，还会白白浪费昂贵的机场流量。\n**正确设置**：请在 Clash Verge Rev、Shadowrocket 或 Sing-box 主界面将出站模式设为 **`规则（Rule）`** 模式！规则模式下，国内 IP 与国内域名会自动“直连（DIRECT）”全速走本地宽带，只有海外网站才走代理节点。',
    keywords: ['国内网站变慢', '全局模式', '规则模式', 'Rule', '分流'],
  },
  {
    id: 'faq-25',
    category: 'speed',
    question: '什么叫“Rule 规则分流”与“Global 全局代理”？分别在什么时候使用？',
    answer:
      '- **Rule（规则模式，日常 99% 场景推荐）**：根据内置 GeoIP / Geosite 分流列表智能判断。国内网站直连不耗流量，Google/YouTube/GitHub 等自动走外网节点，ChatGPT/Netflix 还可进一步分流至指定地区（如美国/新加坡节点）；\n- **Global（全局模式，仅特殊排查使用）**：所有流量强制经过选定节点。仅当你遇到极个别海外小众网站或客户端内置规则未收录导致分流失效（或测试全链路连通性）时才临时切换；使用完记得切回 Rule 模式。',
    keywords: ['Rule', 'Global', '规则模式', '全局模式', '分流'],
  },
  {
    id: 'faq-26',
    category: 'speed',
    question: '为什么在 Clash / Shadowrocket 里测速延迟显示 `Timeout / 超时`，连上去却能打开网页？',
    answer:
      '客户端里的“测延迟”本质上是向预设的检测 URL（通常是 `http://www.gstatic.com/generate_204`）发一次 HTTP 请求：\n1. 如果你在客户端设置的测速超时时间太短（例如只有 1000ms），而某冷门欧美节点物理握手需要 1200ms，就会直接判定为超时红字，但实际连接后完全可用；\n2. 若客户端设置了错误的本地测速地址（被本地运营商 DNS 污染的地址），也会全部显示 Timeout。可将测速 URL 调整为 `http://cp.cloudflare.com/generate_204` 并把超时调至 3000–5000ms 后重测。',
    keywords: ['Timeout', '超时', '测速显示超时', 'gstatic'],
  },
  {
    id: 'faq-27',
    category: 'speed',
    question: '客户端里的“TUN 模式（虚拟网卡）”和“系统代理（System Proxy）”有什么区别？',
    answer:
      '- **系统代理（System Proxy）**：只接管遵守系统 HTTP/SOCKS 代理设置的程序（如 Chrome、Edge 等浏览器），日常开网页完全够用且最省电，但终端命令行（Git/curl/npm）、游戏客户端（Steam/Valorant）、部分 UWP/桌面应用常常**无视系统代理**导致不走梯子；\n- **TUN 模式**：在系统底层创建一个虚拟网卡直接接管全部网络流量（TCP + UDP），能完美代理终端、Docker、游戏及所有顽固客户端！\n**建议**：平时刷网页开系统代理即可；运行游戏、终端开发或某桌面软件死活走不了代理时，以管理员权限开启 **TUN 模式**。',
    keywords: ['TUN模式', '虚拟网卡', '系统代理', '终端不走代理', 'Git'],
  },

  // ==================== 4. AI与流媒体解锁 (9条) ====================
  {
    id: 'faq-28',
    category: 'ai-streaming',
    featured: true,
    question: '2027机场推荐榜单上的节点能否稳定访问 ChatGPT、Claude 和解锁流媒体？',
    answer:
      '可以。本站 2027 精选收录的 35 家服务商均经过多轮流媒体与 AI 大模型风控实测：榜单头部梯队原生支持 **OpenAI ChatGPT-4o / o1 / o3、Claude 3.5/4、Gemini、Midjourney、Cursor**，并支持 **Netflix（网飞）、Disney+、YouTube Premium、TikTok** 的 4K/8K 原生解锁。如遇上游风控波动，头部专线机场通常会在几小时内完成纯净 IP 池的热切换。',
    keywords: ['ChatGPT', 'Claude', 'Netflix', '流媒体解锁', 'AI'],
  },
  {
    id: 'faq-29',
    category: 'ai-streaming',
    featured: true,
    question: '为什么使用某些节点登录 ChatGPT 或 Claude 时会提示 `Access Denied` 或无限转圈人机验证？',
    answer:
      '核心原因在于**节点 IP 被滥用拉黑（脏 IP）或地区不支持**：\n1. **禁止使用香港节点访问 OpenAI / Claude / Gemini**！OpenAI 与 Anthropic 对香港、中国大陆、俄罗斯等地区不提供服务，就算规则没拦截也必报地区不支持或封号；\n2. **避免万人共用的廉价机房 IP**：OpenAI 与 Cloudflare 风控对被批量爬接口、大量人同时注册的数据中心 IP 极为敏感；\n**解决**：在客户端的分流规则（或手动切节点）中，将 AI 工具指向**日本、新加坡、台湾或美国纯净住宅 IP 节点**（如隐形人、微风网络、暮光加速）。',
    keywords: ['ChatGPT报错', 'Claude封号', 'Access Denied', '人机验证'],
  },
  {
    id: 'faq-30',
    category: 'ai-streaming',
    question: '使用 ChatGPT、Claude 应该优先选择哪个国家或地区的节点？香港节点能用吗？',
    answer:
      '**绝对不要使用香港节点登录 Claude 或 ChatGPT 账号！** 香港 IP 属于大模型官方禁区，轻则拒绝访问，重则直接触发 Claude 账号封禁。\n推荐使用以下 4 个地区的干净落地节点：\n- **新加坡 / 日本节点**：延迟最低（仅 40–70ms）、响应流式输出最快，适合高频网页问答与 Cursor 编程；\n- **台湾节点**：对中文界面及 Gemini、OpenAI 兼容性极佳；\n- **美国原生住宅节点**：支持最完整的功能（包括部分仅限美区先行的语音/Sora/高级特性），且不易被风控误杀。',
    keywords: ['ChatGPT地区', 'Claude地区', '新加坡', '美国', '香港不能用'],
  },
  {
    id: 'faq-31',
    category: 'ai-streaming',
    question: '什么是 Netflix“自制剧解锁”与“非自制全剧集解锁”？怎么看才对？',
    answer:
      'Netflix 根据 IP 纯净度会返回两种不同内容库：\n- **非原生/脏 IP（仅自制剧）**：虽然能打开官网，但只能看《怪奇物语》《鱿鱼游戏》等少量 Netflix Originals 自制片，搜不到版权美剧、热门日漫与电影；\n- **全解锁原生/纯净 IP**：可完整观看当地片库所有热播剧与电影（例如台湾/新加坡/日本港区海量华语字幕剧集）。\n一般机场会在节点名或测速说明中标注 `NF` 或 `全解锁`；如需高画质无阻看剧，优选 **暮光加速、星岛梦 StarDream、Firefly机场、隐形人**。',
    keywords: ['Netflix', '奈飞', '自制剧', '全解锁'],
  },
  {
    id: 'faq-32',
    category: 'ai-streaming',
    question: '用哪些节点看 TikTok 不会黑屏或零播放？做 TikTok 跨境电商该怎么选？',
    answer:
      'TikTok 对设备和网络环境检测极其严苛：\n- **普通刷视频看海外版**：注意**不要用香港节点**（TikTok 已退出香港市场，香港 IP 会直接导致黑屏无网络连接），请选用日本、台湾、新加坡、美区或英国原生解锁节点（如 **浪网 WaveNet**、**隐形人**、**云界线**）；\n- **跨境店铺运营与发视频防零播放**：需先拔除国内 SIM 卡（或屏蔽运营商信息）+ 手机定位/语言时区与目标市场对齐 + 选择具备**干净海外住宅/商用 IP 池**的机场，避免多店铺共用脏 IP 造成限流与关联。',
    keywords: ['TikTok', '黑屏', '零播放', '跨境电商', '防关联'],
  },
  {
    id: 'faq-33',
    category: 'ai-streaming',
    question: '看 YouTube 卡顿、只能选 480P、或者出现大量广告是怎么回事？',
    answer:
      '- **缓冲卡顿上不去 4K/8K**：优先检查是否走对了低负载专线节点（右键视频选“详细统计信息 Stats for nerds”，看 `Connection Speed` 是否低于 30,000 Kbps；看 4K 视频至少需稳定在 25,000 Kbps 以上，8K 需 60,000+ Kbps）；\n- **广告变多**：如果你之前挂香港节点，部分香港商业 IP 广告较少；切到美区或日本住宅 IP 后会按当地标准展示大量贴片广告（可开通 YouTube Premium 家庭组或用浏览器的广告拦截扩展解决）；\n- **会员区异常**：若购买的 YouTube Premium 出现锁区或提示不支持，切回支持会员账号归属地的节点即可。',
    keywords: ['YouTube', '4K', '8K', 'Connection Speed', '卡顿'],
  },
  {
    id: 'faq-34',
    category: 'ai-streaming',
    question: '看 Disney+、HBO Max、Apple TV+、AbemaTV 各自对节点地区有什么要求？',
    answer:
      '不同流媒体平台有严格区域版权与反代理限制：\n- **Disney+**：推荐香港、台湾、新加坡或美国全解锁节点（港台节点繁中字幕全、延迟低）；\n- **HBO Max**：主要在欧美及部分亚太/拉美地区开放，推荐美国或新加坡解锁节点；\n- **Hulu / ESPN+**：严格限制美国本土原生住宅 IP；\n- **AbemaTV / NicoNico / DMM / 巴哈姆特动画疯**：分别严格锁死日本原生 IP 与台湾原生 IP，只有原生落地节点（如 **Firefly机场**、**星岛梦**、**暮光加速** 的特定标注节点）才能秒过检测。',
    keywords: ['Disney+', 'HBO Max', 'Hulu', 'AbemaTV', '动画疯'],
  },
  {
    id: 'faq-35',
    category: 'ai-streaming',
    question: '亚马逊卖家、PayPal 收款和 Stripe 登录为什么特别怕“脏 IP 跳来跳去”？',
    answer:
      '支付机构与大型电商平台拥有极其敏感的风控引擎。如果在同一个浏览器或会话里，你的出口 IP 上一分钟还在新加坡、下一分钟自动均衡切去了美国或德国，或者与几百位灰产用户共用一个已经被污染的数据中心 IP，平台会立刻判定账号存在盗号风险或批量关联，进而触发冻结审核（KYC/二审）。\n**最佳实践**：外贸商务请固定选用单个纯净住宅节点（**关闭客户端的“自动测速轮询切换”功能**！），推荐选择 **微风网络 Breezenet**、**浪网 WaveNet**、**云界线**、**可信云**。',
    keywords: ['PayPal', 'Stripe', 'Amazon', '防关联', '关闭自动切换'],
  },
  {
    id: 'faq-36',
    category: 'ai-streaming',
    question: '程序员用节点拉取 GitHub、Docker 镜像、npm、HuggingFace 或用 Cursor 编程卡顿怎么办？',
    answer:
      '开发者常见“明明浏览器能开 Google，终端里 `git clone` 或 `docker pull` 却超时”的问题：\n1. **终端默认不走系统代理**：请直接在客户端中开启 **TUN（虚拟网卡）模式**，或者在终端手动执行代理环境变量导出（如 `export https_proxy=http://127.0.0.1:7897`）；\n2. **Cursor / GitHub Copilot 断连**：检查客户端分流规则里是否将 `github.com`、`cursor.sh`、`openai.com` 放到了直连或地区不匹配的节点，建议把开发常用域名统一分流到**日本或新加坡专线节点**，延时低且吞吐极稳。',
    keywords: ['GitHub', 'Docker', 'HuggingFace', 'Cursor', '程序员'],
  },

  // ==================== 5. 客户端软件与订阅配置 (9条) ====================
  {
    id: 'faq-37',
    category: 'clients',
    featured: true,
    question: '2027年新手推荐使用什么客户端软件导入机场订阅？',
    answer:
      '不同系统平台目前公认最稳、最现代化的客户端如下：\n- **Windows / macOS**：首选 **Clash Verge Rev**（开源免费、界面精致、内置最新 Mihomo 内核完美支持 Hysteria 2 与 Reality）或 **Sing-box**；\n- **iOS（iPhone / iPad）**：入门性价比首选 **Shadowrocket（小火箭）**，进阶自动化玩家可选 **Loon**、**Stash** 或 **Surge**；\n- **Android（安卓手机/平板）**：推荐 **Clash Meta for Android（CMFA）** 或 **Sing-box（SFA）**，兼容全部主流机场订阅协议。\n所有榜单机场官网后台均提供“一键导入”按钮，点一下即可自动唤起客户端并拉取全套节点与分流规则。',
    keywords: ['客户端推荐', 'Clash Verge Rev', 'Shadowrocket', 'Sing-box', '小火箭'],
  },
  {
    id: 'faq-38',
    category: 'clients',
    question: 'Windows 和 macOS 上，Clash Verge Rev、Clash Nyanpasu 和 Sing-box 怎么选择？',
    answer:
      '- **Clash Verge Rev（最推荐 90% 用户）**：目前桌面端生态最完善、更新极活跃的 Mihomo GUI 客户端，支持图形化启用 TUN 模式、WebDAV 备份配置与一键导入订阅；\n- **Clash Nyanpasu**：同样基于 Mihomo 内核，界面风格偏二次元清爽风，规则处理也很优秀，可作备选；\n- **Sing-box 官方内核 / GUI 客户端**：架构极其先进轻量、内存占用极低，适合极客玩家、软路由或部分专门主打 Sing-box 原生订阅的新锐机场。\n请注意：**务必只从 GitHub 官方开源仓库或机场官网内置网盘下载正版安装包**，严防搜索引擎广告里的盗版假冒客户端木马！',
    keywords: ['Clash Verge Rev', 'Nyanpasu', 'Sing-box', '正版下载'],
  },
  {
    id: 'faq-39',
    category: 'clients',
    question: 'iPhone / iPad 没有海外 Apple ID，怎么下载 Shadowrocket（小火箭）？',
    answer:
      '由于政策原因，Shadowrocket（小火箭）、Loon、Stash、Quantumult X 均已从中国大陆区 App Store 下架：\n1. **正规操作流程**：免费注册一个**美区或港区 Apple ID**（注册地区选美国即可免绑信用卡），或者通过靠谱渠道购买/租用外区成品号，在 App Store 退出当前国区账号并登录外区账号；\n2. 搜索 **Shadowrocket**（价格约 $2.99 美元，一次购买终身可用，务必认准正版蓝白小火箭图标与开发者名称 `Shadow Launch Technology Limited`）；\n3. **安全铁律**：**绝对不要在手机“系统设置 -> iCloud”里登录别人分享的公共 Apple ID**（有远程锁机盗号风险），只能仅在 **App Store 商店内部**切换账号下载，下载完毕后立即退回你自己的国区账号即可！',
    keywords: ['Shadowrocket', '小火箭', '外区Apple ID', 'iOS下载', '防锁机'],
  },
  {
    id: 'faq-40',
    category: 'clients',
    question: '安卓手机推荐用 Clash Meta for Android 还是 v2rayNG？为什么有时导不进去？',
    answer:
      '强烈建议首选 **Clash Meta for Android（简称 CMFA）** 或 **FlClash / Sing-box**！\n很多新手误安装了已经停更多年的旧版原版 `Clash for Android（CFA）` 或老旧版 `v2rayNG`：\n- 旧版 CFA 内核不支持 2027 主流的 **Hysteria 2** 与 **VLESS-Reality** 协议，导致导入机场订阅后直接报错解析失败或所有节点消失；\n- 在机场面板首页“软件下载”页面直接下载该机场同步适配的 **Clash Meta / FlClash / Sing-box** 最新版 APK，即可 100% 顺利导入。',
    keywords: ['安卓', 'Android', 'Clash Meta', 'v2rayNG', '导入失败'],
  },
  {
    id: 'faq-41',
    category: 'clients',
    question: '点击“一键导入订阅”没反应，或者手动复制链接导入报错 `Failed to fetch` 怎么办？',
    answer:
      '导入订阅失败通常有以下 4 个原因与一键修复办法：\n1. **订阅转换地址/拉取域名被本地 DNS 污染**：先开启机场官网提供的“本地代理/直连镜像”，或勾选客户端右上角的**“通过代理更新订阅”**（如果有正在使用的旧梯子）；\n2. **机场后台订阅链接被重置过**：回到机场官网面板重新点击“复制订阅地址”，不要用几个月前保存的旧链接；\n3. **链接前后带了多余空格或中文文字**：确认复制的内容是以 `https://` 开头的纯 URL；\n4. **部分国产手机浏览器拦截了自定义唤醒协议**：用 Chrome / Edge 或系统自带浏览器打开机场官网再点一键导入，或者直接复制链接进客户端“订阅 -> 新建/粘贴导入”。',
    keywords: ['一键导入', 'Failed to fetch', '订阅报错', '更新订阅失败'],
  },
  {
    id: 'faq-42',
    category: 'clients',
    question: '客户端报错 `TLS handshake timeout`、证书失效或全部节点连不上，先查哪一项？',
    answer:
      '先立刻检查**电脑或手机的系统时钟（日期与时间）**！\n现代主流代理协议（Shadowsocks-2022、Trojan、VMess、TLS/Reality）对客户端和服务器端的时间差极为敏感，如果电脑主板电池没电或系统时区错乱，导致**本地时间与真实北京时间相差超过 60–90 秒**，所有加密握手都会被服务器直接拒绝，表现出来就是全节点红字或连接秒断！\n在 Windows“日期和时间”中点击**“立即同步（Sync now）”**后重连，往往一秒钟恢复正常。',
    keywords: ['时间同步', 'TLS错误', '节点全红', '连接超时'],
  },
  {
    id: 'faq-43',
    category: 'clients',
    question: '什么是“机场订阅链接”？为什么绝对不能把自己的订阅地址发给别人或传到网盘？',
    answer:
      '机场订阅链接（Subscription URL）本质上是**包含你账户身份密钥（Token）和全套服务器节点密码的凭证网址**。任何人拿到你的订阅链接，都可以直接导入你的全部节点，白嫖耗光你的套餐流量、占用你的在线设备数，甚至触发同时在线风控导致账号封禁，更可能暴露部分历史操作记录。\n**切勿将订阅链接截图发在微信群、贴吧或上传至公开 GitHub/网盘**；一旦怀疑泄露，请立即登录机场面板点击“重置订阅地址（Reset Subscription）”，旧链接会立刻失效。',
    keywords: ['订阅链接安全', '订阅泄露', '重置订阅', 'Token'],
  },
  {
    id: 'faq-44',
    category: 'clients',
    question: '家里路由器（OpenWrt / 华硕梅林）可以挂载机场，实现 PS5、Switch 和电视全家加速吗？',
    answer:
      '可以！这也是游戏主机与智能电视（Apple TV / 索尼电视看 Netflix）玩家最常用的方案：\n- 在软路由 **OpenWrt** 上安装 **OpenClash**、`PassWall` 或 `HomeProxy (Sing-box)`，把机场订阅导入路由器，家里所有连接 Wi-Fi 的设备无需安装任何 App 即可自动科学上网并智能分流国内直连；\n- **注意设备数与 UDP**：路由器整体算作 1 个本地出口但高并发可能被严格机场监测；如果是为了打 PS5 / Switch 联机，请确认购买的机场支持 **Full-Cone NAT / UDP 转发** 且并发数宽松（如 **光速云**、**飞V**、**隐形人**），并留意避免误将电视 4K 视频长期挂在高倍率节点。',
    keywords: ['路由器', 'OpenWrt', 'OpenClash', 'PS5', 'Switch', 'Apple TV'],
  },
  {
    id: 'faq-45',
    category: 'clients',
    question: '客户端要不要开启“自动更新订阅”？一般多久更新一次最合适？',
    answer:
      '**强烈建议开启自动更新订阅**，更新间隔设置为 **12 小时或 24 小时**即可。\n因为机场主在后台更换防封锁中转入口 IP、新增流媒体解锁节点或替换被风控的域名时，不会通知你手动重装软件，只会同步更新在订阅服务器里。开启自动更新订阅能让你在每次开机时自动拿到最新、最健康的可用节点，大幅减少“突然有几个节点不能用了”的烦恼。',
    keywords: ['自动更新订阅', '更新间隔', '更新节点'],
  },

  // ==================== 6. 计费、多设备与安全隐私 (8条) ====================
  {
    id: 'faq-46',
    category: 'billing-security',
    featured: true,
    question: '一个机场订阅可以同时在几台手机或电脑上使用？超过数量会怎么样？',
    answer:
      '榜单中绝大多数常规套餐支持 **2 到 5 台设备同时并发在线**（例如自己的 Windows 台式机、MacBook 笔记本、iPhone 和 iPad 同时挂着同一条订阅链接完全没问题），部分主打多设备并发的商家（如 **光速云 LightSpeed**）甚至提供超宽松或无限制并发方案。\n如果把个人订阅账号随意分享给十几个朋友同时在线，超出限制后新设备会被拒绝连接，严重异常并发可能会触发风控系统临时封禁；多人共享建议挑选支持高并发的家庭/团队商务档。',
    keywords: ['多设备', '同时在线', '共享账号', '设备限制'],
  },
  {
    id: 'faq-47',
    category: 'billing-security',
    question: '月付机场的流量是自然月 1 号清零，还是从购买那天算起？剩余流量能结转吗？',
    answer:
      '绝大多数主流机场采用的是**“按购买日（订单周期日）结算”**：例如你在每月 18 号下单购买月付 200G 套餐，那么下个月 18 号系统会自动重置为你恢复满额 200G（极少数老牌机场按每月 1 号重置，购买页均会明确写明）。\n**注意**：包月周期套餐当月未用完的剩余流量通常**不会叠加累积到下个月**，到期即刷新重置；如果您每个月用得很少怕浪费，直接买“不限时按量计费”套餐更省钱。',
    keywords: ['流量重置', '清零', '结转', '购买日'],
  },
  {
    id: 'faq-48',
    category: 'billing-security',
    question: '如果才到月中，套餐流量就不小心提前用完了怎么办？只能再买一个新套餐吗？',
    answer:
      '不需要重新从头买一个新账号！主流机场后台均提供以下 2 种常见解决途径：\n1. **“重置当月流量”按钮**：在官网个人中心支付少量差价或固定金额，立刻把当前周期剩余流量清零补满至套餐额度（到期日期不变）；\n2. **购买叠加流量包或直接提前续费升档**：如果你发觉每月经常不够用，可以直接续订更高流量规格的套餐。\n*小贴士*：检查是不是挂着梯子挂机下载了 Steam 大型游戏或 Windows 更新包导致流量异常蒸发。',
    keywords: ['流量用完了', '重置流量', '流量包', '流量偷跑'],
  },
  {
    id: 'faq-49',
    category: 'billing-security',
    question: '在机场官网使用支付宝、微信或 USDT 支付安全吗？会不会泄露隐私？',
    answer:
      '目前大多数机场接入的支付宝/微信通道是第三方聚合支付接口，收款方账单通常显示为普通电商或云服务商名称。但从隐私最小化原则出发，建议遵循以下安全规范：\n1. **注册账号请使用专属干净的海外邮箱或小号邮箱**（例如 Gmail、ProtonMail、Outlook 或一次性隔离小号），不要直接用实名手机号码或与工作深度绑定的常用主密码作为机场后台密码；\n2. 不要开启同一套密码到处通用；\n3. 如果自己熟悉加密货币或对匿名性要求极高，部分机场同样支持 USDT (TRC20/Polygon) 结算。',
    keywords: ['支付安全', '支付宝', '微信', 'USDT', '隐私注册'],
  },
  {
    id: 'faq-50',
    category: 'billing-security',
    question: '购买机场后发现本地宽带用着不快，或者不喜欢，可以申请退款吗？',
    answer:
      '由于网络代理属于虚拟即时消耗型数字服务，绝大多数机场在付款后默认不支持“无理由全额退回支付宝”（部分机场支持在消费流量极低、如购买 24 小时内使用小于 1GB 的情况下**原路退回官网钱包余额**或按规定比例客服协商退单）。\n因此，**最稳妥的防损试错方式永远是：先开一个月最低入门版，或先买 1 元/几元体验试用包（如有），或者选择 10–20 元首月优惠套餐亲自测速验证后再决定长期使用！**',
    keywords: ['退款', '试用', '防损', '体验包'],
  },
  {
    id: 'faq-51',
    category: 'billing-security',
    question: '使用机场翻墙时，机场主能不能看到我聊天的具体内容和网银密码？',
    answer:
      '只要你访问的网站开启了 **HTTPS（浏览器地址栏带小锁图标）**，包括 Google、ChatGPT、银行网站、社交软件，所有交互内容在离开你电脑浏览器前就已经通过 **端到端 TLS 加密**，无论是运营商还是机场服务器，最多只能看到你解析访问了“哪一个域名（SNI）”，**绝对无法解密或窥视你的账号密码、聊天文本和具体浏览页面路径**。\n反之，如果你在公共代理环境下访问了没有任何加密的老旧明文 `http://` 网站，才会有泄密风险——浏览敏感内容请务必认准 `https://`。',
    keywords: ['隐私安全', 'HTTPS', '机场能看到记录吗', '加密'],
  },
  {
    id: 'faq-52',
    category: 'billing-security',
    question: '什么是机场的“审计规则”？为什么几乎所有机场都禁止用节点挂迅雷或 BT/PT 下载？',
    answer:
      '几乎所有合规运维的专线机场都会在后台配置“基础安全审计（Audit Rules）”，主要拦截两类高危流量：\n1. **P2P / BT / PT / 迅雷 / 磁力下载**：在海外（尤其美欧日机房），版权方对 BT 下载极度敏感，只要节点 IP 漏出一个 BT 种子流量，机房会立刻发来版权警告信（DMCA）甚至**直接拔网线封停整台服务器**，连累全机房用户断网！\n2. **恶意扫端口、DDOS 攻击、垃圾邮件群发与违法涉政/暴恐网站**：同样是为了防止上游数据中心清退机器与合规风控。日常下载国内资源或 BT 请在规则模式下走直连或先关闭代理。',
    keywords: ['审计规则', '禁止BT', 'DMCA', '迅雷', '封机器'],
  },
  {
    id: 'faq-53',
    category: 'billing-security',
    question: '使用本站页面上的推荐注册链接或“优惠码”下单，真的能减免费用吗？',
    answer:
      '是的！本站（`jichangtuijian2027.blog`）与收录的 35 家品牌均直接对接了专属通道参数或折扣券码：\n- 部分机场链接（如 URL 后自带 `#/?code=...` 参数）在注册时即自动绑定官方渠道特惠或首单折扣；\n- 本站卡片和对比表格里也为你提取好了每一家对应的 **专属优惠码（可点击一键复制）**，你在机场官网结账选购套餐时的“优惠券/折扣码（Promo Code）”输入框粘贴验证即可生效立减。\n*提示：部分机场的折扣码仅限“月付以上周期”或“新注册首单用户”可用，请以结账页提示为准。*',
    keywords: ['优惠码', '折扣码', 'Affiliate', '首单优惠', '怎么用优惠码'],
  },

  // ==================== 7. 榜单实测与故障排查 (7条) ====================
  {
    id: 'faq-54',
    category: 'troubleshooting',
    featured: true,
    question: '如果遇到机场官网打不开或客户端节点全红超时，应该如何按顺序排查？',
    answer:
      '请按以下“排错 5 步法”快速定位，95% 的断连都能在 2 分钟内自愈：\n1. **核对系统时间**：检查电脑/手机右下角时间是否与北京时间同步（差超 1 分钟必红）；\n2. **查看剩余流量与到期时间**：是否当月流量刚巧用尽或订阅已过期（流量耗尽时节点会全部拒绝连接）；\n3. **更新订阅列表**：在客户端点击“更新订阅”，看是否有新替换上来的可用节点或官方公告提示；\n4. **检查多代理冲突**：关闭电脑里正在运行的其他 VPN（如某某游戏加速器、公司内网 VPN、浏览器去广告代理插件等），它们会抢占本地系统代理端口；\n5. **切换应急网络/备用机场**：若确认官网域名被阻断，用手机热点或备用按量机场先打开原机场防失联发布页。',
    keywords: ['全红', '打不开', '断网排查', '故障处理'],
  },
  {
    id: 'faq-55',
    category: 'troubleshooting',
    question: '忘记了之前购买机场的最新防失联官网（原网址被墙打不开），怎么找回登录入口？',
    answer:
      '1. **查看注册邮箱与客户端订阅提示**：很多机场会在你订阅链接最上方生成一个名叫 `官网地址：xxx` 或 `最新防失联域名：xxx` 的伪节点，在 Clash/小火箭里直接看节点名字就能找到新网址！\n2. **查看订阅域名**：你订阅链接开头的主域名或机场官方发给你的注册欢迎邮件里，通常附带了永久导航发布页（GitHub Pages 或备用域名）；\n3. **加入官方 Telegram 通知频道**：使用任意可用网络先访问你在注册时收藏的 TG 频道，管理员置顶消息永远放着最新可用域名。',
    keywords: ['防失联', '官网打不开', '找不到入口', '导航页'],
  },
  {
    id: 'faq-56',
    category: 'troubleshooting',
    question: '2027 榜单前十名（隐形人、暮光加速、微风网络、飞猫云、大佬云等）分别最适合谁？',
    answer:
      '可根据自身第一核心诉求快速对号入座：\n- **综合机皇与高隐匿稳健首选**：**#1 隐形人**（9.9分，晚高峰几乎 0 丢包，全能主力）；\n- **4K/8K 超大带宽追剧发烧友**：**#2 暮光加速**、**#4 飞猫云**、**#10 Firefly机场**；\n- **外贸商务、跨境电商、纯净住宅 IP**：**#3 微风网络 Breezenet**、**#8 浪网 WaveNet**；\n- **对断线零容忍的企业骨干级专线**：**#5 大佬云**（及 #15 官方灾备通道）；\n- **外服电竞游戏、移动/校园网强穿透**：**#6 飞V**、**#7 灵动云**、**#12 闪跃 FlashLeap**；\n- **低价高性价比学生主力**：**#9 梯子云 LadderCloud**、**#24 U1S1**。',
    keywords: ['隐形人', '暮光加速', '微风网络', '飞猫云', '大佬云', '品牌对比'],
  },
  {
    id: 'faq-57',
    category: 'troubleshooting',
    question: '玩外服游戏（CS2、APEX、Valorant、LoL 外服、FF14、原神国际服）怎么选节点才不卡？',
    answer:
      '玩游戏的核心不是最高下载速度，而是 **抖动（Jitter）和丢包率（Packet Loss）**：\n1. 务必选标有 **IPLC 专线 + 支持完整 UDP 转发 / Hysteria 2** 的品牌（如 **飞V**、**闪跃 FlashLeap**、**闪电鼠**、**边缘节点 EdgeNova**、**灵动云**）；\n2. 优先选**港台、日本或新加坡专线节点**就近接入对应游戏区服（例如日服选沪日 IPLC、亚服选深港 IEPL）；\n3. **千万关闭客户端的“自动测速轮询（url-test）”**，改用固定手动节点（`select`），否则游戏打到一半后台自动换节点必掉线！\n4. 用 Windows 游戏客户端务必打开 **TUN 模式**。',
    keywords: ['游戏节点', 'CS2', 'APEX', 'Valorant', '跳ping'],
  },
  {
    id: 'faq-58',
    category: 'troubleshooting',
    question: '为什么榜单里既有“#5 大佬云”，又有“#15 大佬云（旗舰备用通道）”？有什么区别？',
    answer:
      '两者同属优质老牌专线服务体系，但承担了不同的入口域名与通道分工：\n- **#5 大佬云（主通道 `vip.dalaocloud.com`）**：作为官方默认主要入口门户，集合全部常规与高速旗舰 IPLC 线路；\n- **#15 大佬云（旗舰备用通道 `a01vipaff.dalaoyunaff.com`）**：针对复杂网络时期或单一域名被地方运营商缓存干扰的场景设立的独立灾备推广/访问入口。\n如果您所在地区恰好无法打开其中一个入口，可直接尝试另一个官方直达通道。',
    keywords: ['大佬云', '备用通道', '双入口'],
  },
  {
    id: 'faq-59',
    category: 'troubleshooting',
    question: 'Windows 电脑退出了 Clash / 代理软件后，浏览器反而完全打不开任何网页怎么修复？',
    answer:
      '这是极常见的新手“异常退出残留系统代理”故障（例如直接强制关机或任务管理器强杀 Clash 进程，软件没来得及帮你关闭 Windows 系统代理开关）：\n**3 秒修复方法**：\n1. 打开 Windows **设置 -> 网络和 Internet -> 代理（Proxy）**；\n2. 找到“手动设置代理”下方的**“使用代理服务器”开关，将其设为【关闭】**即可瞬间恢复国内正常上网！\n*预防习惯*：关闭代理软件时尽量右键右下角托盘图标选“退出（Quit）”或在界面先关掉“系统代理”开关。',
    keywords: ['退出后断网', '打不开网页', '系统代理残留', 'Windows设置'],
  },
  {
    id: 'faq-60',
    category: 'troubleshooting',
    question: '本站（jichangtuijian2027.blog）的 2027 测速榜单多久更新一次？如何保证测评客观？',
    answer:
      '本站每日自动化监控所有 35 家收录品牌的入口连通率与订阅解析状态，每周由测评团队在电信（163）、联通（169）、移动（CMI）三大真实家庭宽带环境下进行晚高峰（20:00–23:00）压测与流媒体/AI 风控抽检。\n我们坚持：**如实记录月付门槛与各家真实优缺点**（适合专线商务的绝不吹成便宜学生盘，性价比中继也客观告知电信晚高峰局限），同时同步维护各品牌的最新优惠码与防失联官方入口，方便不同需求的访客一次选对、拒绝踩坑。',
    keywords: ['jichangtuijian2027.blog', '更新频率', '客观测评', '实测方法'],
  },
];
