// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'LoutikDOCS',
  tagline: 'DevOps, Administration système & Administration Réseau',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.loutik.fr',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'],
  },

  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      ({
        hashed: true,
        language: ["fr"],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      }),
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {name: 'keywords', content: 'bts sio, devops, proxmox, k3s, kubernetes, documentation, système, réseau, loutik'},
        {name: 'description', content: 'Portfolio et documentation technique du projet Loutik. Tutoriels DevOps, installation Proxmox/K3s et fiches de révisions BTS SIO.'},
        // Open Graph
        {property: 'og:title', content: 'LoutikDOCS - DevOps & SysAdmin'},
        {property: 'og:description', content: 'Découvrez mes projets Homelab et mes fiches techniques pour le BTS SIO.'},
        {property: 'og:type', content: 'website'},
        {property: 'og:url', content: 'https://docs.loutik.fr'},
        {property: 'og:image', content: 'https://docs.loutik.fr/img/loutikdocs-social-card.jpg'},
      ],
      // Replace with your project's social card
      image: 'img/loutikdocs-social-card.png',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'LoutikDOCS',
        logo: {
          alt: 'Logo LoutikDOCS',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Wiki',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/firetoak',
            position: 'right',
            className: 'header-github-link',
          },
          {
            href: 'https://www.linkedin.com/in/louismedo/',
            position: 'right',
            className: 'header-linkedin-link',
          },
          {
            href: 'https://discord.com/invite/yqQJhYM9tK',
            position: 'right',
            className: 'header-discord-link',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Navigation',
            items: [
              {
                label: 'Wiki',
                to: '/docs/intro',
              },
              {
                label: 'Blog',
                to: '/blog',
              },
            ],
          },
          {
            title: 'Connexions',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/firetoak',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/louismedo/',
              },
              {
                label: 'Mail',
                href: 'mailto:louis@loutik.fr',
              },
            ],
          },
          {
            title: 'Légal',
            items: [
              {
                label: 'Mentions Légales',
                to: '/docs/mentions-legales',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Loutik, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
