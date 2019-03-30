var net = require('net');
var server = net.createServer(function (socket) {
    // confirm socket connection from client
    console.log((new Date()) + 'A client connected to server...');
    socket.on('data', function (data) {
        var string = (data.toString());
        console.log(string)
    });
    // send info to client
    socket.write('Echo from server: NODE.JS Server \r\n');
    socket.pipe(socket);
    socket.end();
    console.log('The client has disconnected...\n');
}).listen(10337);