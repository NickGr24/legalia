module.exports = {
  extends: ['expo', '@react-native-community', '@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Warn instead of error to not block builds
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'warn',
    'prefer-const': 'warn',
    // Disable rules that conflict with Prettier
    'react-native/no-inline-styles': 'off',
  },
  env: {
    'react-native/react-native': true,
  },
};