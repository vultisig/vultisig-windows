import { SolanaJupiterToken } from '@core/chain/coin/jupiter/token'

export type PartialInstruction = {
  programId: any
  programData: Uint8Array
  accounts: any
}

export type ParsedSolanaTransactionParams = {
  authority: string | undefined
  inputToken: SolanaJupiterToken
  outputToken?: SolanaJupiterToken
  inAmount: number
  outAmount?: number
  receiverAddress?: string
}

export type ParsedInstructionsSolanaSwapParams = {
  authority: string
  inputMint: string
  outputMint: string
  inAmount: number
  outAmount: number
}
