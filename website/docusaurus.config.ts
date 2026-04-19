import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'tusq.dev',
  tagline:
    'Open-source capability compiler CLI for turning supported Node.js APIs into reviewed manifests, approved tool definitions, and a describe-only MCP surface.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://tusq.dev',
  baseUrl: '/',

  organizationName: 'shivamtiwari93',
  projectName: 'tusq.dev',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl: 'https://github.com/shivamtiwari93/tusq.dev/tree/main/website/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/shivamtiwari93/tusq.dev/tree/main/website/',
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
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'tusq.dev',
      items: [
        {
          to: '/docs/getting-started',
          label: 'Docs',
          position: 'left',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/shivamtiwari93/tusq.dev',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started',
            },
            {
              label: 'CLI Reference',
              to: '/docs/cli-reference',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/shivamtiwari93/tusq.dev',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} tusq.dev. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.github,
    },
  } satisfies Preset.ThemeConfig,
  customFields: {
    description:
      'tusq.dev v0.1.0 docs and blog for the open-source capability compiler CLI for Express, Fastify, and NestJS with a describe-only MCP surface.',
  },
};

export default config;
