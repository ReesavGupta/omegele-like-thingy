"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const ws_1 = require("ws");
const userManager_1 = __importDefault(require("./managers/userManager"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({
    server: server,
});
wss.generateIdForSocketConnections = (socket) => {
    let id = Math.random() * 10000;
    id = ++id * 69;
    socket.id = id;
};
const userManager = new userManager_1.default();
wss.on('connection', (socket) => {
    wss.generateIdForSocketConnections(socket);
    userManager.addUser(socket);
});
const port = 3000;
server.listen(port, () => {
    console.log(`server running at port: ${port}`);
});
