const { withModuleFederationPlugin, shareAll } = require('@angular-architects/module-federation/webpack');

const baseConfig = withModuleFederationPlugin({
  name: 'taskflow-component',
  filename: 'remoteEntry.js',
  exposes: {
    './Module': './src/app/app.component.ts',
    './Routes': './src/app/app.routes.ts',
    './ProjectListComponent': './src/app/features/project/project-list.component.ts'
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: false, eager: false }),
  },
});

module.exports = {
  ...baseConfig,

  output: {
    ...baseConfig.output,
    publicPath: "https://taskflow-component.netlify.app/",
    uniqueName: "taskflow-component"
  },

  optimization: {
    ...baseConfig.optimization,
    runtimeChunk: false
  },
};