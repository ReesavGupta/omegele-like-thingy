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
    console.log(`yes we are inside clear queue`)

    const poppedId1 = this.queue.pop()?.id
    const poppedId2 = this.queue.shift()?.id

    const user1: CustomWebSocket | undefined = this.users.find(
      (x) => x.id === poppedId1
    )

    const user2: CustomWebSocket | undefined = this.users.find(
      (x) => x.id === poppedId2
    )
    if (!user1 || !user2) return
    console.log('we passed early return')

    this.room.createRoom(user1, user2)

    // this.initHandlers()

    this.clearQueue()
  }

  public initHandlers = (socket: CustomWebSocket) => {
    console.log(`hello`)
    socket.onmessage = (event) => {
      console.log(`hello again`)
      if (!(typeof event.data === 'string')) {
        return
      }

      const message = JSON.parse(event.data)

      console.log(`this is messagetype: ${message.type}`)

      if (message.type === 'offer') {
        console.log(`we have reached offerrrrrrr`)

        const { sdp, roomId }: { sdp: string; roomId: string } = message.data
        console.log(`this is sdp: ${sdp} and ${roomId}`)
        this.room.onOffer(sdp, roomId, socket)
      } else if (message.type === 'answer') {
        const { sdp, roomId }: { sdp: string; roomId: string } = message.data

        this.room.onAnswer(sdp, roomId, socket)
      } else if (message.type === 'add-ice-candidate') {
        console.log(`we have reached add-ice candidate`)

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
