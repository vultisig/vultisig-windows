export type SaplingNote = {
  txid: string
  outputIndex: number
  value: number
  rcm: string
  cmu: string
  nullifier: string
  witnessPosition: number
  witnessPath: string
  spent: boolean
  createdAt: number
  noteData?: string
  witnessData?: string
}
