const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for woff/woff2 fonts which are needed for some vector icons on web
config.resolver.assetExts.push('woff', 'woff2', 'ttf');

module.exports = config;
