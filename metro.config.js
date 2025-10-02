const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': './src',
  '@/components': './src/components',
  '@/screens': './src/screens',
  '@/navigation': './src/navigation',
  '@/utils': './src/utils',
  '@/services': './src/services',
  '@/assets': './src/assets',
};

module.exports = config; 