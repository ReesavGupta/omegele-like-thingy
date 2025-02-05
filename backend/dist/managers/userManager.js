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
            var _a, _b;
            console.log(`yes we are inside clear queue`);
            const poppedId1 = (_a = this.queue.pop()) === null || _a === void 0 ? void 0 : _a.id;
            const poppedId2 = (_b = this.queue.shift()) === null || _b === void 0 ? void 0 : _b.id;
            const user1 = this.users.find((x) => x.id === poppedId1);
            const user2 = this.users.find((x) => x.id === poppedId2);
            if (!user1 || !user2)
                return;
            console.log('we passed early return');
            this.room.createRoom(user1, user2);
            // this.initHandlers()
            this.clearQueue();
        };
        this.initHandlers = (socket) => {
            console.log(`hello`);
            socket.onmessage = (event) => {
                console.log(`hello again`);
                if (!(typeof event.data === 'string')) {
                    return;
                }
                const message = JSON.parse(event.data);
                console.log(`this is messagetype: ${message.type}`);
                if (message.type === 'offer') {
                    console.log(`we have reached offerrrrrrr`);
                    const { sdp, roomId } = message.data;
                    console.log(`this is sdp: ${sdp} and ${roomId}`);
                    this.room.onOffer(sdp, roomId, socket);
                }
                else if (message.type === 'answer') {
                    const { sdp, roomId } = message.data;
                    this.room.onAnswer(sdp, roomId, socket);
                }
                else if (message.type === 'add-ice-candidate') {
                    console.log(`we have reached add-ice candidate`);
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
