"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoomManager {
    constructor() {
        this.createRoom = (user1, user2) => {
            console.log(`inside create room`);
            console.log(`this is user1 ${user1.id} this is user2 ${user2.id}`);
            const roomId = this.generateRoomId();
            const room = { user1, user2 };
            this.rooms.set(roomId, room);
            user1.send(JSON.stringify({
                type: 'send-offer',
                data: roomId,
            }));
            user2.send(JSON.stringify({
                type: 'send-offer',
                data: roomId,
            }));
        };
        this.onOffer = (sdp, roomId, socket) => {
            const room = this.rooms.get(roomId);
            if (!this.rooms.get(roomId)) {
                return;
            }
            const recievingSocket = (room === null || room === void 0 ? void 0 : room.user1.id) === socket.id ? room === null || room === void 0 ? void 0 : room.user2 : room === null || room === void 0 ? void 0 : room.user1;
            if (!recievingSocket) {
                return;
            }
            recievingSocket.send(JSON.stringify({
                type: 'offer',
                data: {
                    sdp,
                    roomId,
                },
            }));
        };
        this.onAnswer = (sdp, roomId, socket) => {
            const room = this.rooms.get(roomId);
            if (!room) {
                return;
            }
            const answeringUser = room.user1.id === socket.id ? room.user2 : room.user1;
            answeringUser.send(JSON.stringify({
                type: 'answer',
                data: {
                    sdp,
                    roomId,
                },
            }));
        };
        this.onAddIceCandidate = (roomId, candidate, type, socket) => {
            const room = this.rooms.get(roomId);
            if (!room) {
                return;
            }
            const receivingUser = room.user1.id === socket.id ? room.user2 : room.user1;
            receivingUser.send(JSON.stringify({
                type: 'add-ice-candidate',
                data: {
                    candidate,
                    type,
                },
            }));
        };
        this.rooms = new Map();
    }
    generateRoomId() {
        const roomId = Math.random() * 100000 + 100;
        return roomId.toString();
    }
}
exports.default = RoomManager;
