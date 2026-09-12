import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import rehypeTableWrapper from './src/plugins/rehype-table-wrapper.mjs';

export default defineConfig({
  site: 'https://pocketark-docs.example.com',
  markdown: {
    rehypePlugins: [rehypeTableWrapper],
  },
  integrations: [
    starlight({
      title: 'PocketArk',
      description:
        'PocketArk 桌面应用基础框架官方文档：从 clone 到改名，从第一个插件到打包发布。',
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
        en: { label: 'English', lang: 'en' },
      },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/custom.css'],
      components: {
        SiteTitle: './src/components/SiteTitle.astro',
      },
      lastUpdated: true,
      editLink: {
        baseUrl: 'https://github.com/hmilyld/PocketArk-Docs/edit/main/',
      },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/hmilyld/PocketArk' }],
      head: [
        {
          tag: 'script',
          content:
            "if (typeof localStorage !== 'undefined' && localStorage.getItem('starlight-theme') === null) localStorage.setItem('starlight-theme', 'light');",
        },
      ],
      expressiveCode: {
        themes: ['github-light', 'github-dark'],
        styleOverrides: { borderRadius: '0.375rem' },
      },
      sidebar: [
        {
          label: '开始使用',
          translations: { en: 'Getting Started' },
          items: ['start/introduction', 'start/installation', 'start/scaffold'],
        },
        {
          label: '架构',
          translations: { en: 'Architecture' },
          items: [
            'architecture/overview',
            'architecture/capabilities',
            'architecture/security',
          ],
        },
        {
          label: '插件开发',
          translations: { en: 'Plugin Development' },
          items: [
            'plugins/overview',
            'plugins/create',
            'plugins/manifest',
            'plugins/frontend',
            'plugins/backend',
            'plugins/database',
            'plugins/settings',
          ],
        },
        {
          label: '开发约定',
          translations: { en: 'Conventions' },
          items: [
            'conventions/ipc-errors',
            'conventions/data-http',
            'conventions/styles',
            'conventions/pitfalls',
          ],
        },
        {
          label: '打包发布',
          translations: { en: 'Build & Release' },
          items: [
            'release/build',
            'release/updates',
            'release/automation',
            'release/troubleshooting',
          ],
        },
        {
          label: '本地层',
          translations: { en: 'Local Layer' },
          items: ['local-layer'],
        },
        {
          label: '参考',
          translations: { en: 'Reference' },
          items: ['reference/faq', 'reference/limitations', 'reference/changelog'],
        },
      ],
    }),
  ],
});
