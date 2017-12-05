var os = require('os');

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}


const ip = addresses[0];
const port = 8080;

const http = require("http");
const express = require('express');
const fs = require('fs');

const app = express();
const server = app.listen(port,ip);

app.use(express.static('public'));

console.log('Server: Listening on '+ip+':'+port);

const socket = require('socket.io');

let io = socket(server);

var up;

io.sockets.on('connection', function(socket){
    let interval = setInterval(function(){
        try {
            fs.readFile('data.json', 'utf8', function (err, data) {
                if (err){  }
                else{
                    try {
                        up = JSON.parse(data);
                    } catch(err) {
                        console.log(err);
                    }
                    //console.log(up);
                    socket.broadcast.emit('update',up);
                }
            });
        } catch(err) {
            console.log(err);
        }
        //socket.broadcast.emit('update', data);
    },50);

});
