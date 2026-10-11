import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// 首屏关键语言：同步打包，避免 hydration 不匹配 + 首屏空白闪烁
// 其它 14 个语言由 i18next-http-backend 按需加载
import zh from './locales/zh.json';
import en from './locales/en.json';

const supportedLanguages = ['zh', 'en', 'ja', 'es', 'ar', 'fr', 'it', 'id', 'ms', 'pt', 'ru', 'de', 'ko', 'vi', 'th'];

// 从 localStorage 读取保存的语言，避免 hydration 不匹配
function getInitialLanguage(): string {
  // 0. 优先从 URL 参数读取（支持分享链接直接指定语言）
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang && supportedLanguages.includes(urlLang)) {
      return urlLang;
    }
  } catch {}

  // 1. 先尝试 localStorage
  try {
    const stored = localStorage.getItem('i18nextLng');
    if (stored && supportedLanguages.includes(stored)) {
      return stored;
    }
  } catch {}

  // 2. 从浏览器语言推断
  try {
    const navLang = navigator.language || '';
    const langCode = navLang.split('-')[0].split('_')[0].toLowerCase();
    if (supportedLanguages.includes(langCode)) {
      return langCode;
    }
  } catch {}

  // 3. 默认中文
  return 'zh';
}

console.log('[i18n] init start, lng=', getInitialLanguage());

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // 默认打包 zh + en，其余 14 个语言由 backend 按需加载
    resources: {
      zh: { translation: zh },
      en: { translation: en },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'zh',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lang',
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    backend: {
      // 按需加载语言资源：/locales/xx.json 通过 Vite public/ 目录提供
      loadPath: '/locales/{{lng}}.json',
    },
    // 关键: resources 只声明了 zh+en, 告诉 i18next 这是"部分 bundled" 资源,
    // 这样 lng=ja 时仍会触发 backend 加载 ja.json (而非误以为已经完整)
    partialBundledLanguages: true,
    // 加载其他语言时由 React 渲染层处理 (useSuspense=false 避免和 React 18 顶层 Suspense 冲突)
    react: {
      useSuspense: false,
    },
  });

// 同步刷新 index.html 里首屏 loading 文案 —— 它在 React 挂载前就显示,
// 不能走 t(), 否则非中文用户会一直看到中文 slogan。
const LOADER_TEXTS = {
  zh: '让本草品牌 · 稳稳走向世界',
  en: 'Guiding Bencao brands, steadily into the world',
  ja: '本草ブランドを、確かな世界へ',
  ko: '본초 브랜드를 세계로 안전히',
  de: 'Bencao-Marken sicher in die Welt',
  fr: 'Accompagner les marques Bencao vers le monde',
  es: 'Marcas Bencao, paso firme hacia el mundo',
  pt: 'Marcas Bencao, com passo firme para o mundo',
  it: 'Marchi Bencao, verso il mondo',
  id: 'Merek Bencao, melangkah pasti ke dunia',
  ms: 'Jenama Bencao, melangkah mantap ke dunia',
  vi: 'Đưa thương hiệu Bencao vững bước ra thế giới',
  ru: 'Бренды Bencao — уверенно в мир',
  th: 'พาสินค้าเปิยฉ่านสู่โลกอย่างมั่นคง',
  ar: 'نقود علامات Bencao نحو العالم بثبات',
};

// 首屏 loading 在 React 挂载前就显示, 无法走 t(); 直接按 i18n.language 上色。
// 立即调用一次(不要只靠 languageChanged —— 首次事件早于本模块订阅)。
const paintLoader = () => {
  const el = document.querySelector('[data-i18n-loader]');
  if (el) el.textContent = LOADER_TEXTS[i18n.language] ?? LOADER_TEXTS.en;
};
i18n.on('languageChanged', paintLoader);
i18n.on('loaded', paintLoader);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', paintLoader);
} else {
  paintLoader();
}

export default i18n;
