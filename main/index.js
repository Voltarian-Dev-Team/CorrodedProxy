const http = require('http');
const fs = require('fs');
const path = require('path');
const ngrok = require('@ngrok/ngrok');
const Corrosion = require('../lib/server');

const proxy = new Corrosion({
    codec: 'xor',
    prefix: '/proxy/'
});

proxy.bundleScripts();

const server = http.createServer((request, response) => {
    if (request.url.startsWith(proxy.prefix)) {
        return proxy.request(request, response);
    }
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8'));
});

server.on('upgrade', (clientRequest, clientSocket, clientHead) => proxy.upgrade(clientRequest, clientSocket, clientHead));

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, async () => {
    console.log(`Node.js web server at ${PORT} is running...`);

    // Connect to ngrok
    try {
        const listener = await ngrok.connect({ addr: PORT, authtoken_from_env: true });
        console.log(`Ingress established at: ${listener.url()}`);
    } catch (err) {
        console.error('Failed to establish ngrok tunnel:', err);
    }
});
