/* eslint-disable */
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: __dirname + '/app/main.js',
  output: {
    path: __dirname + '/assets',
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [{
            loader: 'css-loader',
            query: {
              modules: true,
              localIdentName: '[name]__[local]--[hash:base64:5]',
            }
          }, {
            loader: 'sass-loader',
          }],
          fallback: 'style-loader',
        })
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false&progressive=true'
        ]
      },
      {
        test: /\.woff$/,
        use: 'file-loader'
      },
      {
        test: /\.mp3$/,
        use: 'file-loader'
      }
    ]
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new ExtractTextPlugin('style.css'),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
  ],

  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      soundmanager2: 'soundmanager2/script/soundmanager2-nodebug-jsmin.js'
    }
  }
}
