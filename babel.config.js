module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./src'],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/screens': './src/screens',
          '@/navigation': './src/navigation',
          '@/utils': './src/utils',
          '@/services': './src/services',
          '@/assets': './src/assets'
        },
      }],
      ['transform-remove-console', { exclude: ['error', 'warn'] }],
    ],
  };
}; 