import { useEffect, useRef, useState } from 'react'

interface RoomProps {
  localVideoTrack: MediaStreamTrack | undefined
}

export const Room: React.FC<RoomProps> = ({ localVideoTrack }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [lobby, setLobby] = useState<boolean>(true)
  const [sendingPc, setSendingPC] = useState<RTCPeerConnection | null>(null)
  const [receivingPc, setReceivingPC] = useState<RTCPeerConnection | null>(null)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000')
    socketRef.current = socket

    socket.onopen = () => console.log('✅ WebSocket connected')
    socket.onerror = (err) => console.error('❌ WebSocket error', err)

    socket.onmessage = async (message) => {
      const data = JSON.parse(message.data)
      console.log('📩 Received WebSocket Message:', data)

      switch (data.type) {
        case 'send-offer': {
          setLobby(false)
          const roomId = data.data
          const pc = new RTCPeerConnection()

          if (!localVideoTrack) {
            console.warn('⚠️ No local video track found.')
            return
          }

          const stream = new MediaStream([localVideoTrack])
          if (localVideoRef.current) localVideoRef.current.srcObject = stream

          pc.addTrack(localVideoTrack, stream)

          setSendingPC(pc)

          pc.onicecandidate = (e) => {
            if (e.candidate) {
              socket.send(
                JSON.stringify({
                  type: 'add-ice-candidate',
                  data: { roomId, candidate: e.candidate, type: 'sender' },
                })
              )
            }
          }

          pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            socket.send(
              JSON.stringify({ type: 'offer', data: { sdp: offer, roomId } })
            )
          }

          break
        }

        case 'offer': {
          const { roomId, sdp: remoteSdp } = data.data
          setLobby(false)

          const pc = new RTCPeerConnection()
          setReceivingPC(pc)

          pc.onicecandidate = (e) => {
            if (e.candidate) {
              socket.send(
                JSON.stringify({
                  type: 'add-ice-candidate',
                  data: { roomId, candidate: e.candidate, type: 'receiver' },
                })
              )
            }
          }

          pc.ontrack = async (event) => {
            console.log('🎥 Track event received:', event)

            if (event.streams.length > 0 && remoteVideoRef.current) {
              console.log('✅ Remote stream received:', event.streams[0])

              if (remoteVideoRef.current.srcObject !== event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0]
              }

              try {
                const isPlaying =
                  remoteVideoRef.current.currentTime > 0 &&
                  !remoteVideoRef.current.paused &&
                  !remoteVideoRef.current.ended &&
                  remoteVideoRef.current.readyState >
                    remoteVideoRef.current.HAVE_CURRENT_DATA

                if (!isPlaying) {
                  // video.play()
                  console.log('above playyyyyyy')
                  const playInstance = await remoteVideoRef.current
                    .play()
                    .catch((e) => console.warn('video play error: ', e))

                  console.log('play instance:', playInstance)

                  console.log('▶️ Remote video playing')
                }
              } catch (err) {
                console.error('❌ Error playing remote video:', err)
              }
            } else {
              console.warn('⚠️ No streams in track event.')
            }
          }

          await pc.setRemoteDescription(new RTCSessionDescription(remoteSdp))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)

          socket.send(
            JSON.stringify({ type: 'answer', data: { sdp: answer, roomId } })
          )

          break
        }

        case 'answer': {
          if (sendingPc) {
            await sendingPc.setRemoteDescription(
              new RTCSessionDescription(data.data.sdp)
            )
          }
          break
        }

        case 'add-ice-candidate': {
          const { candidate, type } = data.data
          try {
            if (type === 'sender' && receivingPc) {
              await receivingPc.addIceCandidate(new RTCIceCandidate(candidate))
              console.log('✅ Receiver added ICE candidate:', candidate)
            } else if (type === 'receiver' && sendingPc) {
              await sendingPc.addIceCandidate(new RTCIceCandidate(candidate))
              console.log('✅ Sender added ICE candidate:', candidate)
            }
          } catch (error) {
            console.error('❌ Error adding ICE candidate:', error)
          }
          break
        }

        case 'lobby':
          setLobby(true)
          break

        default:
          console.warn('⚠️ Unknown WebSocket message type:', data.type)
          break
      }
    }

    return () => {
      console.log('🧹 Cleaning up WebRTC connections...')
      socket.close()
      sendingPc?.close()
      receivingPc?.close()
    }
  }, [localVideoTrack])

  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {
      const stream = new MediaStream([localVideoTrack])
      localVideoRef.current.srcObject = stream
    }
  }, [localVideoTrack])

  useEffect(() => {
    const enablePlayback = () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current
          .play()
          .catch((err) => console.warn('Playback failed:', err))
      }
    }

    document.addEventListener('click', enablePlayback)
    document.addEventListener('keydown', enablePlayback)

    return () => {
      document.removeEventListener('click', enablePlayback)
      document.removeEventListener('keydown', enablePlayback)
    }
  }, [])

  return (
    <div>
      <h3>{lobby ? '⌛ Waiting for connection...' : '✅ Connected!'}</h3>
      <video
        ref={localVideoRef}
        width={500}
        height={500}
        autoPlay
        muted
        playsInline
      />
      <video
        ref={remoteVideoRef}
        width={500}
        height={500}
        autoPlay
        playsInline
      />
    </div>
  )
}
