import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type SeoEntry = {
  lang: string;
  title: string;
  description: string;
  ogLocale: string;
  siteName: string;
};

const DEFAULT_SEO: SeoEntry = {
  lang: 'en',
  title: 'Qihuang Sihai | AI Decision System for TCM Global Expansion',
  description:
    'Qihuang Sihai is an AI-powered decision operating system for TCM, supplements, Hanfang skincare and health products. Evaluate market priority, entry compliance, cost ROI, channel fit and project risk before committing resources to global expansion.',
  ogLocale: 'en_US',
  siteName: '岐黄四海 QihuangSihai',
};

const SEO_BY_LANGUAGE: Record<string, SeoEntry> = {
  en: DEFAULT_SEO,
  zh: {
    lang: 'zh-CN',
    title: '岐黄四海 | 中医出海决策操作系统',
    description:
      '岐黄四海是面向中医、保健食品、汉方护肤与健康产品的出海决策操作系统。帮助企业在进入全球市场前，先完成市场优先级、准入合规、成本ROI、渠道匹配与项目风险的AI判断。',
    ogLocale: 'zh_CN',
    siteName: '岐黄四海 QihuangSihai',
  },
  ja: {
    lang: 'ja',
    title: '岐黄四海 | TCM海外展開の意思決定システム',
    description:
      '岐黄四海は中医薬・健康食品・漢方のグローバル展開に向けたAI意思決定システムです。市場優先度、准入コンプライアンス、コストROI、チャネル適合、リスク判断为您提供全面的 решения.',
    ogLocale: 'ja_JP',
    siteName: '岐黄四海 QihuangSihai',
  },
  es: {
    lang: 'es',
    title: '岐黄四海 | Sistema de Decision AI para Expansion Global de MTC',
    description:
      '岐黄四海 es un sistema operativo de decisiones AI para TCM, suplementos y cuidado Hanfang. Evalúe prioridad de mercado, cumplimiento, ROI, canales y riesgo antes de comprometerse con la expansion global.',
    ogLocale: 'es_ES',
    siteName: '岐黄四海 QihuangSihai',
  },
  fr: {
    lang: 'fr',
    title: '岐黄四海 | Systeme de Decision IA pour l\'Expansion Mondiale de la MTC',
    description:
      '岐黄四海 est un systeme de decision IA pour TCM, complements et soins Hanfang. Evaluez la priorite marche, la conformite, le ROI, les canaux et les risques avant de vous engager dans l\'expansion mondiale.',
    ogLocale: 'fr_FR',
    siteName: '岐黄四海 QihuangSihai',
  },
  de: {
    lang: 'de',
    title: '岐黄四海 | KI-Entscheidungssystem fur Globale TCM-Expansion',
    description:
      '岐黄四海 ist ein KI-gestutztes Entscheidungssystem fur TCM, Nahrungsergdnzungsmittel und Hanfang-Hautpflege. Bewerten Sie Marktprioritat, Compliance, ROI, Kanale und Risiken, bevor Sie sich zur globalen Expansion verpflichten.',
    ogLocale: 'de_DE',
    siteName: '岐黄四海 QihuangSihai',
  },
  pt: {
    lang: 'pt',
    title: '岐黄四海 | Sistema de Decisao AI para Expansão Global da MTC',
    description:
      '岐黄四海 e um sistema de decisao AI para TCM, suplementos e skincare Hanfang. Avalie prioridade de mercado, conformidade, ROI, canais e riscos antes de se comprometer com a expansao global.',
    ogLocale: 'pt_BR',
    siteName: '岐黄四海 QihuangSihai',
  },
  ar: {
    lang: 'ar',
    title: '岐黄四海 | نظام القرار الذكي للتوسع العالمي في الطب الصيني التقليدي',
    description:
      '岐黄四海 هو نظام تشغيل قرار AI لمنتجات الطب الصيني التقليدي والمكملات والعناية Hanfang. قم بتقييم اولوية السوق والامتثال والعائد على الاستثمار والقنوات والمخاطر قبل الالتزام بالتوسع العالمي.',
    ogLocale: 'ar_SA',
    siteName: '岐黄四海 QihuangSihai',
  },
  ru: {
    lang: 'ru',
    title: '岐黄四海 | Sistema Prinyatiya Resheniy AI dlya Globalnoy Ekspansii TKM',
    description:
      '岐黄四海 — eto sistema prinyatiya resheniy AI dlya produktov TKM, BADOv i Hanfang. Otsenite prioritet rynka, komplaens, ROI, kanaly i riski, prezhde chem brat na sebya obyazatelstva po globalnoy ekspansii.',
    ogLocale: 'ru_RU',
    siteName: '岐黄四海 QihuangSihai',
  },
  ko: {
    lang: 'ko',
    title: '岐黄四海 | TCM Global Jincheol AI Uisi Gyeoljeong Shisutem',
    description:
      '岐黄四海는 TCM, geombohogsiyong pum, hanbang seukindea pum jjogi roun global jinchul-eul wihan AI uisi gyeoljeong haengtong sisteom-ibnida. Sijang yeoseon gwonjo, juyeok keompeullaieonsu, biyong ROI, cheneol jaryeog hwansong-eul peullaesaigi jeheom-eulo global jinchul-eul gyeoljeong-yeohamyeo.',
    ogLocale: 'ko_KR',
    siteName: '岐黄四海 QihuangSihai',
  },
  id: {
    lang: 'id',
    title: '岐黄四海 | Sistem Keputusan AI untuk Ekspansi Global TCM',
    description:
      '岐黄四海 adalah sistem operasi keputusan AI untuk produk TCM, suplemen, dan perawatan kulit Hanfang. Evaluasilah prioritas pasar, kepatuhan, ROI, kesesuaian saluran, dan risiko proyek sebelum berkomitmen untuk ekspansi global.',
    ogLocale: 'id_ID',
    siteName: '岐黄四海 QihuangSihai',
  },
  ms: {
    lang: 'ms',
    title: '岐黄四海 | Sistem Keputusan AI untuk Pengembangan Global TCM',
    description:
      '岐黄四海 ialah sistem operasi keputusan AI untuk produk TCM, suplement, dan penjagaan kulit Hanfang. Nilai keutamaan pasaran, pematuhan, ROI, kesesuaian saluran dan risiko projek sebelum komitmen untuk pengembangan global.',
    ogLocale: 'ms_MY',
    siteName: '岐黄四海 QihuangSihai',
  },
  vi: {
    lang: 'vi',
    title: '岐黄四海 | He Thong Quyet Dinh AI Cho Viec Mo Rong Toan Cau TCM',
    description:
      '岐黄四海 la he thong van hanh quyet dinh AI cho san pham y hoc co truyen Trung Hoa, thuc pham bo sung va cham soc da Hanfang. Danh gia uu tien thi truong, tuan thu, ROI, phu hop kenhe va rui ro du an truoc khi cam ket mo rong toan cau.',
    ogLocale: 'vi_VN',
    siteName: '岐黄四海 QihuangSihai',
  },
  it: {
    lang: 'it',
    title: '岐黄四海 | Sistema di Decisione AI per l\'Espansione Globale della MTC',
    description:
      '岐黄四海 e un sistema operativo di decisione AI per prodotti MTC, integratori e skincare Hanfang. Valuta priorita di mercato, conformita, ROI, idoneita dei canali e rischi del progetto prima di impegnarti nell\'espansione globale.',
    ogLocale: 'it_IT',
    siteName: '岐黄四海 QihuangSihai',
  },
  lo: {
    lang: 'lo',
    title: '岐黄四海 | Long Bun Took AI Pasoo Thom Kab Nge Optc Global',
    description:
      '岐黄四海 neay tor tae ree sot kar ai jang xeek pp Tee ch输出 TCM, aa jing puu tee lae Hanfang skincare. Juu tee aaya waang jaak radab yang chai kee long tueng pai sie lek Global.',
    ogLocale: 'lo_LA',
    siteName: '岐黄四海 QihuangSihai',
  },
};

function updateMeta(name: string, content: string) {
  const element = document.querySelector(`meta[name="${name}"]`);
  if (element) {
    element.setAttribute('content', content);
  }
}

function updateProperty(property: string, content: string) {
  const element = document.querySelector(`meta[property="${property}"]`);
  if (element) {
    element.setAttribute('content', content);
  }
}

function updateLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute('href', href);
  }
}

export default function SEO() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const rawLanguage = (i18n.language || 'en').split('-')[0].toLowerCase();
    const language = rawLanguage === 'en' ? 'en' : rawLanguage;
    const seo = SEO_BY_LANGUAGE[language] || DEFAULT_SEO;
    const baseUrl = 'https://zxqconsulting.com';
    const currentUrl = new URL(baseUrl);
    if (language !== 'zh' && language !== 'en') {
      currentUrl.searchParams.set('lang', language);
    }

    document.title = seo.title;
    document.documentElement.lang = seo.lang;

    updateMeta('description', seo.description);
    updateMeta('twitter:title', seo.title);
    updateMeta('twitter:description', seo.description);
    updateProperty('og:title', seo.title);
    updateProperty('og:description', seo.description);
    updateProperty('og:locale', seo.ogLocale);
    updateProperty('og:site_name', seo.siteName);
    const canonicalUrl = window.location.href.split('?')[0];
    // 当语言非默认(zh/en)时,URL 应包含 ?lang= 参数以保证 SEO 可索引性
    const currentLang = (i18n.language || 'zh').split('-')[0].toLowerCase();
    const langParam = currentLang !== 'zh' && currentLang !== 'en' ? `?lang=${currentLang}` : '';
    updateProperty('og:url', `${canonicalUrl}${langParam}`);
    updateLink('canonical', `${canonicalUrl}${langParam}`);

    Object.entries(SEO_BY_LANGUAGE).forEach(([code]) => {
      const href = new URL(baseUrl);
      // 所有语言统一使用 ?lang= 参数，确保 hreflang 标签始终包含语言标识
      href.searchParams.set('lang', code);
      updateLink('alternate', href.toString(), code);
    });

    updateLink('alternate', baseUrl, 'x-default');
  }, [i18n.language]);

  return null;
}
