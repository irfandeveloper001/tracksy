// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Force single React instance - critical for React 19 + React Native Web
const reactPath = path.resolve(__dirname, 'node_modules/react');
const reactDomPath = path.resolve(__dirname, 'node_modules/react-dom');

config.resolver = {
  ...config.resolver,
  // Aggressively dedupe React to prevent multiple instances
  extraNodeModules: {
    'react': reactPath,
    'react-dom': reactDomPath,
    'react/jsx-runtime': path.resolve(reactPath, 'jsx-runtime.js'),
    'react/jsx-dev-runtime': path.resolve(reactPath, 'jsx-dev-runtime.js'),
  },
  // Ensure React is resolved correctly for web builds
  resolverMainFields: ['react-native', 'browser', 'main'],
  // Block any other React resolutions
  blockList: [],
};

// Ensure transformer handles React correctly
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
