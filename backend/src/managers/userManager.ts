import { CustomWebSocket } from '../index'
import RoomManager from './roomManager'
export default class userManager {
  public users: CustomWebSocket[]
  public queue: CustomWebSocket[]
  public room: RoomManager

  constructor() {
    this.users = []
    this.queue = []
    this.room = new RoomManager()
  }

  public addUser = (socket: CustomWebSocket): void => {
    this.users.push(socket)
    this.queue.push(socket)
    socket.emit('lobby')

    if (this.queue.length > 2) {
      this.clearQueue()
    }
  }

  public removeUser = (socket: CustomWebSocket): void => {
    this.users.filter((currentSocket) => socket.id !== currentSocket.id)
  }

  public clearQueue = (): void => {
    const user1: CustomWebSocket | undefined = this.users.find(
      (x) => x.id === this.queue.pop()?.id
    )
    const user2: CustomWebSocket | undefined = this.users.find(
      (x) => x.id === this.queue.shift()?.id
    )

    if (!user1 || !user2) return

    this.clearQueue()
  }
}
