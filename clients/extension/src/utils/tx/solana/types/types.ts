import { Connection } from '@solana/web3.js'

export type PartialInstruction = {
  programId: any
  programData: Uint8Array
  accounts: any
}
export type ParserCtx = {
  connection: Connection
  caches?: {
    accountInfo?: Map<string, any>
  }
}

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
