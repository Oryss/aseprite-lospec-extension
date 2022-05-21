"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = __importDefault(require("ws"));
const dotenv_1 = __importDefault(require("dotenv"));
// HTTP server
const app = (0, express_1.default)();
dotenv_1.default.config();
const server = http_1.default.createServer(app);
// WebSocket server
const wss = new ws_1.default.Server({ server });
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log('received: %s', message);
    });
    ws.send('I am the websocket server');
});
// Start the server
server.listen(process.env.PORT, () => {
    console.log(`listening on ${process.env.PORT}`);
});
//# sourceMappingURL=app.js.map