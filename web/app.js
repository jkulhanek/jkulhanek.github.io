var express = require("express");
var app = express();
app.use(express.static('dist'));
app.use('/images', express.static(__dirname + '../dist/images'));
app.use('/resources', express.static(__dirname + '../dist/fonts'));


var server = app.listen(8081, function(){
    var port = server.address().port;
    console.log("Server started at http://localhost:%s", port);
});
