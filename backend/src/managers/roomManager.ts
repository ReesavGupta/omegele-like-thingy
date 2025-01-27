import { CustomWebSocket } from '..'

interface Room {
  user1: CustomWebSocket
  user2: CustomWebSocket
}
export default class RoomManager {
  public rooms: Map<string, Room>
  constructor() {
    this.rooms = new Map<'', Room>()
  }

  public createRoom = (user1: CustomWebSocket, user2: CustomWebSocket) => {
    
  }
}
