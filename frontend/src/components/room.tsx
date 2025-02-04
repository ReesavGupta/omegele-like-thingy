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
  const [remoteVideoStream, setRemoteVideoStream] =
    useState<MediaStream | null>(null)
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null)
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<MediaStreamTrack | null>(null)

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000')
    if (!socket) {
      alert(`server connection error 🙄`)
    }

    socket.onmessage = (message) => {
      const data = JSON.parse(message.data)
      const pc = new RTCPeerConnection()
      switch (data.type) {
        case 'send-offer':
          setLobby(false)

          const { roomId } = data.data

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
          const { roomId: offerRoomId, sdp: remoteSdp } = data.data
          setLobby(false)

          const pc2 = new RTCPeerConnection()
          setRecievingPC(pc2)

          if (!recievingPc) return

          recievingPc.setRemoteDescription(remoteSdp)

          const sdp = recievingPc.createAnswer()

          const stream = new MediaStream()

          if (!remoteVideoRef.current) {
            console.log(`no remote video stream`)
            return
          }

          remoteVideoRef.current.srcObject = stream

          setRemoteVideoStream(stream)

          window.pcr = recievingPc

          recievingPc.ontrack = (e) => {
            alert('ontrack')
          }

          recievingPc.onicecandidate = async (e) => {
            socket.send(
              JSON.stringify({
                data: {
                  candidate: e.candidate,
                  type: 'reciever',
                  roomId,
                },
                type: 'add-ice-candidate',
              })
            )
          }

          socket.send(
            JSON.stringify({
              roomId,
              sdp,
            })
          )

          setTimeout(async () => {
            const track1 = pc.getTransceivers()[0].receiver.track
            const track2 = pc.getTransceivers()[1].receiver.track

            console.log(track1)

            if (track1.kind === 'video') {
              setRemoteAudioTrack(track2)
              setRemoteVideoTrack(track1)
            } else {
              setRemoteAudioTrack(track1)
              setRemoteVideoTrack(track2)
            }

            if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
              // @ts-ignore
              remoteVideoRef.current.srcObject.addTrack(track1)
              // @ts-ignore
              remoteVideoRef.current.srcObject.addTrack(track2)
              await remoteVideoRef.current.play()
            }
          }, 5000)
          break

        case 'answer':
          const { roomId: asnwerRoomId, sdp: answerSdp } = data.data

          setLobby(false)

          setSendingPC((pc) => {
            if (pc) {
              pc.setRemoteDescription(answerSdp)
            }
            return pc
          })

          console.log('loop closed')
          break

        case 'add-ice-candidate':
          const { candidate, type } = data.data
          console.log('add ice candidate from remote')
          console.log({ candidate, type })

          if (type === 'sender') {
            setRecievingPC((pc) => {
              pc?.addIceCandidate(candidate)
              return pc
            })
          } else {
            setSendingPC((pc) => {
              pc?.addIceCandidate(candidate)
              return pc
            })
          }
          break

        case 'lobby':
          setLobby(true)
          break

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
