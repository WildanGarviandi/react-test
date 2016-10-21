const config = require('./config.json')
const express = require('express')
const port = process.env.PORT || config.port
const app = express()

// serve static assets normally
app.use('/css', express.static(__dirname + '/css'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/assets', express.static(__dirname + '/assets'));

// handle every other route with index.html.
app.get('*', function (request, response){
  response.sendFile(__dirname + '/build/index.html');
});

app.listen(port)
console.log("server started on port " + port)
