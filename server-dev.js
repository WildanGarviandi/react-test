"use strict";
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

var express = require('express');
var proxy = require('proxy-middleware');
var url = require('url');

var app = express();
app.use('/assets', proxy(url.parse('http://localhost:8080/assets')));

app.get('/*', function(req, res) {
    res.sendFile(__dirname + '/build/index.html');
});

var server = new WebpackDevServer(webpack(config), {
    contentBase: __dirname + '/build',
    hot: true,
    quiet: false,
    noInfo: false,
    publicPath: "/assets/",

    stats: { colors: true }
});

server.listen(8080, "localhost", function() {});
app.listen(8081);
console.log('listen to 8081');