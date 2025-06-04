import { SolanaJupiterToken } from '@core/chain/coin/jupiter/token'

export type PartialInstruction = {
  programId: any
  programData: Uint8Array
  accounts: any
}

export type ParsedSolanaSwapParams = {
  authority: string | undefined
  inputToken: SolanaJupiterToken
  outputToken: SolanaJupiterToken
  inAmount: number
  outAmount: number
}

export type ParsedInstructionsSolanaSwapParams = {
  authority: string
  inputMint: string
  outputMint: string
  inAmount: number
  outAmount: number
}
