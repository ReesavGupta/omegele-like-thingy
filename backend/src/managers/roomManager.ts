import { CustomWebSocket } from '..'

interface Room {
  user1: CustomWebSocket
  user2: CustomWebSocket
}
export default class RoomManager {
  public rooms: Map<string, Room>
  constructor() {
    this.rooms = new Map<string, Room>()
  }

  public createRoom = (user1: CustomWebSocket, user2: CustomWebSocket) => {
    console.log(`inside create room`)
    console.log(`this is user1 ${user1.id} this is user2 ${user2.id}`)
    const roomId: string = this.generateRoomId()
    const room: Room = { user1, user2 }
    this.rooms.set(roomId, room)
    user1.send(
      JSON.stringify({
        type: 'send-offer',
        data: roomId,
      })
    )
    user2.send(
      JSON.stringify({
        type: 'send-offer',
        data: roomId,
      })
    )
  }

  public onOffer = (sdp: string, roomId: string, socket: CustomWebSocket) => {
    const room = this.rooms.get(roomId)

    if (!this.rooms.get(roomId)) {
      return
    }

    const recievingSocket =
      room?.user1.id === socket.id ? room?.user2 : room?.user1

    if (!recievingSocket) {
      return
    }

    recievingSocket.send(
      JSON.stringify({
        type: 'offer',
        data: {
          sdp,
          roomId,
        },
      })
    )
  }
  public onAnswer = (sdp: string, roomId: string, socket: CustomWebSocket) => {
    const room = this.rooms.get(roomId)
    if (!room) {
      return
    }

    const answeringUser = room.user1.id === socket.id ? room.user2 : room.user1

    answeringUser.send(
      JSON.stringify({
        type: 'answer',
        data: {
          sdp,
          roomId,
        },
      })
    )
  }

  public onAddIceCandidate = (
    roomId: string,
    candidate: string,
    type: string,
    socket: CustomWebSocket
  ) => {
    const room = this.rooms.get(roomId)
    if (!room) {
      return
    }
    const receivingUser = room.user1.id === socket.id ? room.user2 : room.user1

    receivingUser.send(
      JSON.stringify({
        type: 'add-ice-candidate',
        data: {
          candidate,
          type,
        },
      })
    )
  }

  private generateRoomId(): string {
    const roomId = Math.random() * 100000 + 100
    return roomId.toString()
  }
}
