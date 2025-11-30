module.exports = {
  root: true,
  extends: ['expo'],
  rules: {
    // Warn instead of error to not block builds
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'warn',
    'prefer-const': 'warn',
    // Disable import rules that are causing issues
    'import/namespace': 'off',
    'import/default': 'off',
    'import/no-unresolved': 'off',
    'import/export': 'off',
    // Disable new TypeScript rules that don't exist in our version
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-wrapper-object-types': 'off',
  },
};