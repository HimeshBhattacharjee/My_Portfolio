import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
    // dist: build output. private: git-ignored working notes and archived legacy code.
    { ignores: ['dist', 'private'] },
    // Build-tool configuration runs in Node, not the browser.
    {
        files: ['*.config.js', 'scripts/**/*.mjs'],
        languageOptions: { globals: globals.node },
    },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        settings: { react: { version: '18.3' } },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            'react/jsx-no-target-blank': 'off',
            // Plain JavaScript project without the prop-types package.
            'react/prop-types': 'off',
            // React Three Fiber element props, and the lowercase attribute React 18 expects.
            'react/no-unknown-property': ['error', { ignore: ['geometry', 'material', 'frustumCulled', 'fetchpriority'] }],
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
        },
    },
]