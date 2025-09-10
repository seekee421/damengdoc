import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '达梦数据库文档中心',
  tagline: '专业的数据库技术文档平台',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.dameng.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // 配置中英双语支持
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans', 'en'],
    localeConfigs: {
      'zh-Hans': {
        label: '简体中文',
        direction: 'ltr',
        htmlLang: 'zh-CN',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: '达梦数据库文档中心',
      logo: {
        alt: '达梦数据库Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '产品文档',
        },

        {to: '/blog', label: '技术博客', position: 'left'},
        {to: '/search', label: '🔍 搜索', position: 'left'},
        {to: '/editor', label: '📝 编辑器', position: 'left'},
        {to: '/admin', label: '🔧 管理后台', position: 'left'},
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://www.dameng.com',
          label: '官网',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '产品文档',
          items: [
            {
              label: 'DM8 数据库',
              to: '/docs/dm8/intro',
            },
            {
              label: 'DM7 数据库',
              to: '/docs/dm7/intro',
            },
            {
              label: '快速开始',
              to: '/docs/intro',
            },
            {
              label: '安装指南',
              to: '/docs/installation',
            },
          ],
        },
        {
          title: '开发者资源',
          items: [
            {
              label: 'API 文档',
              to: '/docs/api',
            },
            {
              label: 'SDK 下载',
              to: '/docs/sdk',
            },
            {
              label: '示例代码',
              to: '/docs/examples',
            },
            {
              label: '最佳实践',
              to: '/docs/best-practices',
            },
          ],
        },
        {
          title: '社区与支持',
          items: [
            {
              label: '技术论坛',
              href: 'https://eco.dameng.com',
            },
            {
              label: '开发者社区',
              href: 'https://eco.dameng.com/community',
            },
            {
              label: '技术支持',
              href: 'https://www.dameng.com/support',
            },
            {
              label: '问题反馈',
              href: 'https://github.com/dameng/issues',
            },
          ],
        },
        {
          title: '更多资源',
          items: [
            {
              label: '技术博客',
              to: '/blog',
            },
            {
              label: '官方网站',
              href: 'https://www.dameng.com',
            },
            {
              label: '下载中心',
              href: 'https://www.dameng.com/download',
            },
            {
              label: '培训认证',
              href: 'https://www.dameng.com/training',
            },
          ],
        },
      ],
      copyright: `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div>Copyright © ${new Date().getFullYear()} 达梦数据库股份有限公司. Built with Docusaurus.</div>
          <div style="font-size: 0.9em; opacity: 0.8;">专业的国产数据库解决方案提供商 | 自主可控 · 安全可靠</div>
        </div>
      `,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
