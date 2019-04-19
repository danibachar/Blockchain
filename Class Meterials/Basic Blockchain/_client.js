var net = require('net');
var client = new net.Socket();
client.connect(10337, function () {
    console.log('Connected'); // acknowledge socket connection
    client.write('Hello, server! Love, Client.'); // send info to Server
});
client.on('data', function (data) {
    console.log('Received: ' + data); // display info received from server
    client.destroy(); // kill client after server's response
});
client.on('close', function () {
    console.log('Connection closed');
});