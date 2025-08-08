export type SignalMessage =
  | { type: 'peer-join'; peerId: string; name: string; roomId: string; ts: number }
  | { type: 'peer-leave'; peerId: string; roomId: string; ts: number }
  | { type: 'offer'; peerId: string; target: string; sdp: string; ts: number }
  | { type: 'answer'; peerId: string; target: string; sdp: string; ts: number }
  | { type: 'ice'; peerId: string; target: string; candidate: RTCIceCandidateInit; ts: number }
  | { type: 'chat'; peerId: string; text: string; ts: number };


