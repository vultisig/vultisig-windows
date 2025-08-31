export type ParsedResult =
  | {
      kind: 'swap'
      authority: string
      inputMint: string
      outputMint: string
      inAmount: string
      outAmount: string
    }
  | {
      kind: 'transfer'
      authority: string
      inputMint: string
      inAmount: string
      receiverAddress: string
    }

export type AddressTableLookup = {
  accountKey: string
  writableIndexes: number[]
  readonlyIndexes: number[]
}
