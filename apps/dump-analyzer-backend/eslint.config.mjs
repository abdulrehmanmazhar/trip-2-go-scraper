import nodeConfig from 'eslint-config/index.js'
export default [
    ...nodeConfig,
    {
        rules: {
            quotes: ['error', 'single', { allowTemplateLiterals: true }],
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
        },
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname
            }
        }
    }
]
