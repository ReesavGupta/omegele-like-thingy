"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const roomManager_1 = __importDefault(require("./roomManager"));
class userManager {
    constructor() {
        this.addUser = (socket) => {
            this.users.push(socket);
            this.queue.push(socket);
            socket.send(JSON.stringify({
                type: 'lobby',
                data: {},
            }));
            if (this.queue.length >= 2) {
                this.clearQueue();
            }
            this.initHandlers(socket);
        };
        this.removeUser = (socket) => {
            this.users.filter((currentSocket) => socket.id !== currentSocket.id);
        };
        this.clearQueue = () => {
            const user1 = this.users.find((x) => { var _a; return x.id === ((_a = this.queue.pop()) === null || _a === void 0 ? void 0 : _a.id); });
            const user2 = this.users.find((x) => { var _a; return x.id === ((_a = this.queue.shift()) === null || _a === void 0 ? void 0 : _a.id); });
            if (!user1 || !user2)
                return;
            this.room.createRoom(user1, user2);
            // this.initHandlers()
            this.clearQueue();
        };
        this.initHandlers = (socket) => {
            socket.onmessage = (event) => {
                if (!(typeof event.data === 'string')) {
                    return;
                }
                const message = JSON.parse(event.data);
                if (message.type === 'offer') {
                    const { sdp, roomId } = message.data;
                    this.room.onOffer(sdp, roomId, socket);
                }
                else if (message.type === 'answer') {
                    const { sdp, roomId } = message.data;
                    this.room.onAnswer(sdp, roomId, socket);
                }
                else if (message.type === 'add-ice-candidate') {
                    const { roomId, candidate, type, } = message.data;
                    this.room.onAddIceCandidate(roomId, candidate, type, socket);
                }
            };
        };
        this.users = [];
        this.queue = [];
        this.room = new roomManager_1.default();
    }
}
exports.default = userManager;
