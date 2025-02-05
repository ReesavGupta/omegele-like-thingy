import express from 'express'
import { createServer } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import UserManager from './managers/userManager'

export interface CustomWebSocket extends WebSocket {
  id?: number
}
export interface WssInterface extends WebSocketServer {
  generateIdForSocketConnections: (socket: CustomWebSocket) => void
}

const app = express()
const server = createServer(app)

const wss = new WebSocketServer({
  server: server,
}) as WssInterface

wss.generateIdForSocketConnections = (socket: CustomWebSocket) => {
  let id = Math.random() * 10000
  id = ++id * 69
  socket.id = id
}

const userManager = new UserManager()

wss.on('connection', (socket: CustomWebSocket) => {
  wss.generateIdForSocketConnections(socket)

  userManager.addUser(socket)
})

const port = 3000
server.listen(port, () => {
  console.log(`server running at port: ${port}`)
})
