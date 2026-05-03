import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    ignores: [
      '.agents/**',
      '.claude/**',
      '.codex/**',
      '.next/**',
      '.opencode/**',
      '.planning/**',
      '.vercel/**',
      '.wrangler/**',
      '.open-next/**',
      'node_modules/**',
      'out/**',
      'cloudflare-env.d.ts',
    ],
  },
]

export default eslintConfig
