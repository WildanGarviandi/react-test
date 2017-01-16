var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
      './app/main.js',
      'webpack/hot/dev-server',
      'webpack-dev-server/client?http://localhost:8081'
  ],

  output: {
    publicPath: "http://localhost:8081/assets/",
    path: __dirname + "/build",
    filename: "bundle.js"
  },

  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: "json"
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: 'style!css?modules!postcss'
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
        loader: 'url?limit=100000'
      },
      {
        test: /\.mp3$/,
        loader: 'file'
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],

  devServer: {
    contentBase: './build',
    colors: true,
    historyApiFallback: true,
    inline: true,
    hot: true
  } 
}
