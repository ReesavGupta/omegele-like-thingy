ICE candidates (Interactive Connectivity Establishment)

- it is a famework for making two peers connect to eachother.
- there are many reasons why we cant directly connect with other peers
- we need to bypass firewalls which prevent from opening connections
- we also need to give devices a specific "id" as our devices do not have public ip to connect to, we also need to relay the data from your device to the peers which might require an external server(if your router does not allow to directly connect to peers)
- stun and/or turn servers are used to accomplish this.

STUN server

- session traversal utilities for NAT (STUN)
- it is a protocol used to discover your public ip
  -The client will send a request to a STUN server on the Internet who will reply with the client's public address and whether or not the client is accessible behind the router's NAT.

NAT

- Network Address Translation (NAT) is used to give your device a public IP address.
- A router will have a public IP address and every device connected to the router will have a private IP address.
- Requests will be translated from the device's private IP to the router's public IP with a unique port.
- That way you don't need a unique public IP for each device but can still be discovered on the Internet.

- Some routers will have restrictions on who can connect to devices on the network. This can mean that even though we have the public IP address found by the STUN server, not anyone can create a connection. In this situation we need to use TURN.

TURN

- Traversal Using Relays around NAT
- This is meant to bypass the restrictions which the routers put up which interrupt the connection.
- Here what we do is we relay information not directly But through a Turn server to the other device.
- Thus it is used to exchange information.

SDP

- Session Description Protocol (SDP) is a standard for describing the multimedia content of the connection such as resolution, formats, codecs, encryption, etc. so that both peers can understand each other once the data is transferring. This is, in essence, the metadata describing the content and not the media content itself.

- Technically, then, SDP is not truly a protocol, but a data format used to describe connection that shares media between devices.

RTP - Real time transport protocol
 - it a a standard protocol used to enable real time connectivity for exchanging data that needs real time priority

 - important for webRTC as transfering realtime media from peer a to peer b has to be done with minimum latency as possible.

 - webRTC uses SRTP underneath(secure realtime transport protocol)

 - RTCPeerConnection is a Each RTCPeerConnection has methods which provide access to the list of RTP transports that service the peer connection


