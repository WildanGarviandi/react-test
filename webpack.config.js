/* eslint-disable */
const webpack = require('webpack');
const combineLoaders = require('webpack-combine-loaders');

module.exports = {
  entry: [
      './app/main.jsx',
      'webpack/hot/dev-server',
      'babel-polyfill',
      'webpack-dev-server/client?http://localhost:8081'
  ],

  output: {
    publicPath: "http://localhost:8081/assets/",
    path: __dirname + "/build",
    filename: "bundle.js"
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          }, {
            loader: 'css-loader',
            query: {
              modules: true,
              localIdentName: '[name]__[local]--[hash:base64:5]',
            }
          }, {
            loader: 'sass-loader',
          }
        ]
      },
      {
        test: /\.jpg$/,
        loader: "file-loader"
      },
      {
        test: /\.png$/,
        loader: "url-loader?limit=100000"
      },
      {
        test: /\.gif$/,
        loader: "url-loader?limit=100000"
      },
      {
        test: /\.woff$/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.mp3$/,
        loader: 'file-loader'
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],

  devServer: {
    contentBase: './build',
    colors: true,
    historyApiFallback: true,
    inline: true,
    hot: true
  },

  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      soundmanager2: 'soundmanager2/script/soundmanager2-nodebug-jsmin.js'
    }
  },

  resolveLoader: {
    modules: ['node_modules', 'shared']
  }
}
