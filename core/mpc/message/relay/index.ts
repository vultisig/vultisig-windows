export type MpcRelayMessage = {
  session_id: string
  from: string
  to: string[]
  body: string
  hash: string
  sequence_no: number
}
