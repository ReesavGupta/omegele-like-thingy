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

    socket.send(
      JSON.stringify({
        type: 'lobby',
        data: {},
      })
    )

    if (this.queue.length >= 2) {
      this.clearQueue()
    }
    this.initHandlers(socket)
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

    this.room.createRoom(user1, user2)

    // this.initHandlers()

    this.clearQueue()
  }

  public initHandlers = (socket: CustomWebSocket) => {
    socket.onmessage = (event) => {
      if (typeof event.data === 'string') {
        const message = JSON.parse(event.data)

        if (message.type === 'offer') {
          const { sdp, roomId }: { sdp: string; roomId: string } = message.data

          this.room.onOffer(sdp, roomId, socket)
        } else if (message.type === 'answer') {
          const { sdp, roomId }: { sdp: string; roomId: string } = message.data

          this.room.onAnswer(sdp, roomId, socket)
        } else if (message.type === 'add-ice-candidate') {
          const {
            roomId,
            candidate,
            type,
          }: { roomId: string; candidate: string; type: string } = message.data

          this.room.onAddIceCandidate(roomId, candidate, type, socket)
        }
      }
    }
  }
}
