const webpack = require('webpack');

module.exports = {
  babel: {
    plugins: ['@babel/plugin-syntax-import-attributes'],
  },
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
        zlib: require.resolve('browserify-zlib'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser.js'),
        url: require.resolve('url'),
        vm: require.resolve('vm-browserify'),
        fs: false,
        net: false,
        tls: false,
      };

      // Fix module resolution for ESM packages
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': require.resolve('process/browser.js'),
        '@react-native-async-storage/async-storage': false,
      };

      // Add plugins
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser.js',
        })
      );

      // Disable source map warnings for node_modules
      webpackConfig.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes('node_modules') &&
            warning.details &&
            warning.details.includes('source-map-loader')
          );
        },
      ];

      // Insert strict rule for @base-org/account at the top of oneOf to ensure it's hit
      // This is necessary because react-scripts uses a oneOf array for rules
      if (webpackConfig.module.rules) {
        const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf);
        if (oneOfRule) {
          oneOfRule.oneOf.unshift({
            test: /\.js$/,
            include: /node_modules\/@base-org\/account/,
            loader: 'string-replace-loader',
            options: {
              search: / with \{ type: ['"]json['"] \}/g,
              replace: '',
            }
          });
        }
      }

      return webpackConfig;
    },
  },
};