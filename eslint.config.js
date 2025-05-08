import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config({
  ignores: [
    'node_modules/**',
    'src/generated/**/*',
    '**/runtime/*.js',
    '**/index-browser.js',
    '**/edge-esm.js',
    '**/edge.js',
    '**/library.js',
    '**/react-native.js',
    '**/wasm.js',
    'prisma/generated/**',
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    '*.d.ts',
    '.vercel',
    'coverage',
    '.pnp',
    '.pnp.js',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '.env',
    '.env.*',
  ],
  languageOptions: {
    parser: tseslint.parser,
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      tsconfigRootDir: '.',
      ecmaFeatures: {
        jsx: true
      }
    },
  },
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    'react-hooks': reactHooks,
  },
  rules: {
    '@typescript-eslint/no-invalid-this': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-unused-vars': 'off',
    'react/prop-types': 'off',
    'quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
});
