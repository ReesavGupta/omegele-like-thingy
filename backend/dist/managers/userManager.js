"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class userManager {
    constructor() {
        this.addUser = (socket) => {
            this.users.push(socket);
        };
        this.users = [];
    }
}
exports.default = userManager;
