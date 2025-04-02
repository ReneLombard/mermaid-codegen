import { defineConfig, MarkdownOptions } from 'vitepress'
import MermaidExample from './mermaid-markdown-all.ts';

const allMarkdownTransformers: MarkdownOptions = {
  // the shiki theme to highlight code blocks
  theme: {
    light: 'github-light',
    dark: 'github-dark',
  },

  config: (md) => {
    MermaidExample(md);
  },
};
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "mermaid-code-gen",
  description: "Mermaid to source code",
  appearance: 'dark',
  markdown: allMarkdownTransformers,
  themeConfig: {
    nav: [
      { text: 'Documentation', link: '/pages/overview' },
      { text: 'Examples', link: '/markdown-examples' }
    ],
    search: {
      provider: 'local'
    },
    sidebar: [
      { text: 'Overview', link: '/pages/overview' },
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/pages/getting-started/installation' },
          { text: 'Scaffolding your application', link: '/pages/getting-started/scaffolding' },
          { text: 'Creating your first class diagram', link: '/pages/getting-started/creating-your-first-class-diagram.md' }
        ]
      }
    ]
  }
})
