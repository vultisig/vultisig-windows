export type KeysignSignature = {
  msg: string
  r: string
  s: string
  der_signature: string
  recovery_id?: string
}
