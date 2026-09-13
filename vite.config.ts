import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { visualizer } from "rollup-plugin-visualizer"

/**
 * Vite 构建配置
 *
 * 性能优化要点：
 * 1. lucide-react 单独切分 - 400+ 图标按需使用，避免污染主 bundle
 * 2. GSAP 单独切分 - 加载大但仅 5 个组件使用
 * 3. i18n runtime 单独切分
 * 4. ANALYZE=1 时生成 stats.html（dist/bundle-stats.html）
 * 5. chunkSizeWarningLimit 设为 800 抑制误报
 */

// 按包大小切分，避免大依赖混入主 bundle
const manualChunks = (id: string): string | undefined => {
  if (!id.includes('node_modules')) return undefined;

  if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
  if (id.includes('gsap')) return 'vendor-gsap';
  if (id.includes('i18next') || id.includes('react-i18next') || id.includes('i18next-http-backend')) return 'vendor-i18n';
  if (id.includes('lucide-react')) return 'vendor-lucide';
  if (id.includes('@radix-ui')) return 'vendor-radix';
  if (id.includes('sonner') || id.includes('next-themes')) return 'vendor-sonner';
  if (id.includes('vaul') || id.includes('cmdk') || id.includes('embla-carousel') || id.includes('input-otp') || id.includes('react-day-picker') || id.includes('react-resizable-panels')) {
    return 'vendor-ui';
  }
  if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
    return 'vendor-utils';
  }
  if (id.includes('matter-js')) return 'vendor-matter';
  return undefined;
};

const isAnalyze = process.env.ANALYZE === '1';

export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [
    react(),
    ...(isAnalyze
      ? [
          visualizer({
            filename: 'dist/bundle-stats.html',
            open: false,
            gzipSize: true,
            brotliSize: true,
            template: 'treemap',
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks,
      },
    },
    chunkSizeWarningLimit: 800,
    sourcemap: mode !== 'production',
  },
  esbuild: {
    legalComments: 'none',
  },
}));
