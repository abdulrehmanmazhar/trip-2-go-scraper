import nodeConfig from 'eslint-config'
export default [
    ...nodeConfig,
    {
        rules: {
            quotes: ['error', 'single', { allowTemplateLiterals: true }],
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
        }
    }
]
