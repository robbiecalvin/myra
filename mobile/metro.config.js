const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Force Metro to use Node file watching instead of Watchman.
config.watcher = {
  ...(config.watcher || {}),
  useWatchman: false,
};

module.exports = config;
