var path = require('path');
var webpack = require('webpack');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

module.exports = {
  devtool: 'source-map',
  debug: true,

  entry: {
    '@angular': [
      'rxjs',
      'reflect-metadata',
      'zone.js'
    ],
    'common': ['es6-shim'],
    'app': './app/main.ts'
  },

  output: {
    path: __dirname + '/out/',
    publicPath: 'out/',
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    extensions: ['','.ts','.js','.json', '.css', '.html']
  },
  externals: {
    nodegit: 'commonjs nodegit'
},
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loaders: ['ts', 'angular2-template-loader'],
        exclude: [ /node_modules/, /releases/ ]
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(css)$/,
        loader: 'raw'
      },
      {
        test: /\.html$/, 
        loader: 'html'
      },
      {
        test: /\.(png|jpg|svg)$/,
        loader: 'url?limit=10000'
      },
    ]
  },

  plugins: [
    new CommonsChunkPlugin({ names: ['@angular', 'common'], minChunks: Infinity }),
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        jquery: "jquery"
    })
  ],
  target:'electron-renderer'
};
