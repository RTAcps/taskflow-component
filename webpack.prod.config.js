const { withModuleFederationPlugin, shareAll } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  output: {
    publicPath: "https://taskflow-component.netlify.app/"
  },
  name: 'taskflowComponent',
  filename: 'remoteEntry.js',
  exposes: {
    './Module': './src/app/app.component.ts',
    './Routes': './src/app/app.routes.ts',
    './ProjectListComponent': './src/app/features/project/project-list.component.ts'
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: false, eager: false }),
  },
  library: { type: 'var', name: 'taskflowComponent' },
});
