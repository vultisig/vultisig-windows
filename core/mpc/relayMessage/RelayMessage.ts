export type RelayMessage = {
  session_id: string
  from: string
  to: string[]
  body: string
  hash: string
  sequence_no: number
}
