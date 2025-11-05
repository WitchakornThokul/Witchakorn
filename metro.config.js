const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// ซ่อน warnings และ logs ใน production
if (process.env.NODE_ENV === 'production') {
  config.resolver.platforms = [...config.resolver.platforms, 'production'];
}

module.exports = config;