const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 1234 });

console.log('Signaling server running at ws://localhost:1234');

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    ws.on('message', function incoming(message) {
        // Broadcast to everyone else
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => console.log('Client disconnected'));
});
