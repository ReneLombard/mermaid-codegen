import { defineConfig, MarkdownOptions } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid';

// https://vitepress.dev/reference/site-config
export default withMermaid({
  title: "mermaid-code-gen",
  description: "Mermaid to source code",
  appearance: 'dark',
  mermaid:{
    //mermaidConfig !theme here works for light mode since dark theme is forced in dark mode
  },
  markdown: {
    toc: { level: [1, 2, 3, 4] },
  },
  themeConfig: {
    nav: [
      { text: 'Documentation', link: '/pages/overview' },
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
          { text: 'Getting Started', link: '/pages/getting-started/getting-started' },
          { text: 'Language Files Explained', link: '/pages/getting-started/language-files-explained' },
        ]
      },
      { text: 'Avaliable Commands', link: '/pages/commands' },
    ]
  }
})
