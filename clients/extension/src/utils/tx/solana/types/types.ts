export type ParsedResult =
  | {
      kind: 'swap'
      authority: string
      inputMint: string
      outputMint: string
      inAmount: number
      outAmount: number
    }
  | {
      kind: 'transfer'
      authority: string
      inputMint: string
      inAmount: number
      receiverAddress: string
    }

export type AddressTableLookup = {
  accountKey: string
  writableIndexes: number[]
  readonlyIndexes: number[]
}
