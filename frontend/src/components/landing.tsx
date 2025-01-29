import { useEffect, useRef, useState } from 'react'

export const Landing = () => {
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack>()
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack>()
  const [shareScreen, setShareScreen] = useState<boolean>(false)
  const [joined, setJoined] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  async function getMediaStream() {
    let stream: MediaStream
    if (shareScreen) {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      })
    }
    const audioTrack: MediaStreamTrack = stream.getAudioTracks()[0]
    const videoTrack: MediaStreamTrack = stream.getVideoTracks()[0]
    setLocalAudioTrack(audioTrack)
    setLocalVideoTrack(videoTrack)

    if (!videoRef.current) {
      return
    }
    videoRef.current.srcObject = stream
    await videoRef.current.play()
  }

  useEffect(() => {
    getMediaStream()
  }, [shareScreen])
  return (
    <div className="flex justify-center items-center">
      {!joined ? (
        <div className="border p-2 flex justify-center items-center flex-col">
          <video
            className=" border"
            ref={videoRef}
            width={900}
            height={900}
          ></video>
          <div className="flex gap-3 mt-2">
            <button
              className="w-30 border"
              onClick={() => setShareScreen((prev) => !prev)}
            >
              {shareScreen ? 'Stop Presenting' : 'Present'}
            </button>
            <button
              className="w-30 border"
              onClick={() => setJoined(true)}
            >
              Start Chatting
            </button>
          </div>
        </div>
      ) : (
        <div>hello world</div>
      )}
    </div>
  )
}
