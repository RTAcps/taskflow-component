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
    '@angular/core': { singleton: true, strictVersion: false, requiredVersion: 'auto', eager: true },
    '@angular/common': { singleton: true, strictVersion: false, requiredVersion: 'auto', eager: true },
    '@angular/common/http': { singleton: true, strictVersion: false, requiredVersion: 'auto', eager: true },
    '@angular/router': { singleton: true, strictVersion: false, requiredVersion: 'auto', eager: true },
    'rxjs': { singleton: true, strictVersion: false, requiredVersion: 'auto', eager: true },
    ...shareAll({
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto',
      eager: false,
    }),
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