var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: __dirname + "/app/main.js",
  output: {
    path: __dirname + "/assets",
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
        loader: ExtractTextPlugin.extract('style', 'css?modules!postcss')
      },
      { 
        test: /\.jpg$/, 
        loader: "file-loader" 
      },
      { 
        test: /\.png$/, 
        loader: "file-loader" 
      }, 
      { 
        test: /\.gif$/, 
        loader: "file-loader" 
      }, 
      {
        test: /\.woff$/, 
        loader: "file-loader" 
      }
    ]
  },

  resolve: {
    alias: {
      react: "react/dist/react.min.js",
      "react-dom": "react-dom/dist/react-dom.min.js",
      "react-redux": "react-redux/dist/react-redux.min.js",
      "react-router": "react-router/umd/ReactRouter.min.js",
      redux: "redux/dist/redux.min.js",
      "redux-logger": "redux-logger/dist/index.min.js",
      "redux-thunk": "redux-thunk/dist/redux-thunk.min.js",
      underscore: "underscore/underscore-min.js"
    }
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new ExtractTextPlugin("style.css")
  ],
}