import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'getting-started',
      label: 'Getting Started',
    },
    {
      type: 'category',
      label: 'Reference',
      items: ['cli-reference', 'manifest-format', 'configuration'],
    },
    {
      type: 'category',
      label: 'Guides',
      items: ['frameworks', 'mcp-server', 'execution-policy'],
    },
    {
      type: 'category',
      label: 'Help',
      items: ['faq', 'roadmap'],
    },
  ],
};

export default sidebars;
