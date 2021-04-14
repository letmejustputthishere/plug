const path = require('path');

module.exports = {
  webpackFinal: async (config) => {
    config.resolve.alias = {
      '@ui': path.join(path.resolve(__dirname, '../source/ui')),
      '@components': path.join(path.resolve(__dirname, '../source/components')),
    };

    return config;
  },
  "stories": [
    "../source/**/*.stories.mdx",
    "../source/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ]
}