const https = require('https');
const fs = require('fs');
const path = require('path');
const certPath = path.join(__dirname, '../certs/cert.pem');
const keyPath = path.join(__dirname, '../certs/key.pem');
const credentials = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
};
const server = https.createServer(credentials);
const Corrosion = require('../lib/server');
const proxy = new Corrosion({
    codec: 'xor',
    prefix: '/proxy/',
    forceHttps: true
});

proxy.bundleScripts();

server.on('request', (request, response) => {
    if (request.url.startsWith(proxy.prefix)) return proxy.request(request, response);
    response.end(fs.readFileSync(__dirname + '/index.html', 'utf-8'));
}).on('upgrade', (clientRequest, clientSocket, clientHead) => proxy.upgrade(clientRequest, clientSocket, clientHead)).listen(process.env.PORT || 8080);
