const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = getDefaultConfig(__dirname);

// The marketing site under website/ is a separate Next.js app with its own
// node_modules. Keep it out of the Expo/Metro bundler to avoid Haste module
// collisions (duplicate react) and needless crawling.
config.resolver.blockList = exclusionList([/website\/.*/]);

module.exports = config;
