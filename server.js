const express = require('express')
const port = process.env.PORT || 8080
const app = express()

// serve static assets normally
app.use('/assets', express.static(__dirname + '/assets'));

// handle every other route with index.html.
app.get('*', function (request, response){
  response.sendFile(__dirname + '/build/index.html');
});

app.listen(port)
console.log("server started on port " + port)
