const IP = '10.42.0.102';
const SENDPORT = 8001;

setInterval(function() {
    var clientSend = new net.Socket();
    clientSend.connect(SENDPORT, IP, function() {
        console.log('Connected');
        fs.readFile('/prueba.py', (err, data) => { //might be wrong
            if (err) throw err;
            console.log(data);
        });
        clientSend.write(data);
        clientSend.destroy();
    });

    clientSend.on('close', function() {
        console.log('Connection closed');
        clientSend.destroy();
    });

}, 10000);
