// @ts-check

import eslintPluginAstro from 'eslint-plugin-astro'

export default [
  ...eslintPluginAstro.configs.recommended,
  // Global ignores must be in their own object
  {
    ignores: ['public/scripts/*', 'scripts/*', '.astro/', 'src/env.d.ts', '**/.obsidian/**']
  },
  // Rules
  {
    rules: {
      // override/add rules settings here, such as:
      // "astro/no-set-html-directive": "error"
    }
  }
]
