import { useEffect, useRef, useState } from 'react'

interface RoomProps {
  localVideoTrack: MediaStreamTrack | undefined
  localAudioTrack: MediaStreamTrack | undefined
}
export const Room: React.FC<RoomProps> = ({
  localAudioTrack,
  localVideoTrack,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [lobby, setLobby] = useState<boolean>(true)
  const [sendingPc, setSendingPC] = useState<RTCPeerConnection | null>(null)
  const [recievingPc, setRecievingPC] = useState<RTCPeerConnection | null>(null)
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000')
    if (!socket) {
      alert(`server connection error 🙄`)
    }
    setLobby(false)

    const pc = new RTCPeerConnection()

    socket.onmessage = (message) => {
      const data = JSON.parse(message.data)
      switch (data.type) {
        case 'send-offer':
          const { roomId } = data.data
          setLobby(false)
          setSendingPC(pc)
          sendingPc?.addTrack(localVideoTrack!)
          sendingPc?.addTrack(localAudioTrack!)
          pc.addIceCandidate = async (e) => {
            socket.send(
              JSON.stringify({
                data: {
                  roomId: roomId,
                  candidate: e?.candidate,
                  type: 'sender',
                },
                type: 'add-ice-candidate',
              })
            )
          }
          pc.onnegotiationneeded = async () => {
            const sdp = await sendingPc?.createOffer()
            await sendingPc?.setLocalDescription(sdp)
            socket.send(
              JSON.stringify({
                data: {
                  sdp,
                  roomId,
                },
                type: 'offer',
              })
            )
          }
          break
        case 'offer':
        default:
          break
      }
    }
  }, [])

  async function initVideo() {
    if (!localVideoRef || !localVideoRef.current) {
      return
    }
    if (!localVideoTrack) {
      return
    }
    localVideoRef.current.srcObject = new MediaStream([localVideoTrack])
    await localVideoRef.current.play()
  }

  useEffect(() => {
    initVideo()
  }, [])

  return (
    <div>
      <video
        // autoPlay
        ref={localVideoRef}
        width={500}
        height={500}
      ></video>
      <video
        className="border"
        width={500}
        height={500}
        ref={remoteVideoRef}
      ></video>
    </div>
  )
}
