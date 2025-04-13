import { SolanaJupiterToken } from '@core/chain/coin/jupiter/token'

export interface PartialInstruction {
  programId: any
  programData: Uint8Array
  accounts: any
}

export interface ParsedSolanaSwapParams {
  authority: string | undefined
  inputToken: SolanaJupiterToken
  outputToken: SolanaJupiterToken
  inAmount: number
  outAmount: number
}

export interface ParsedInstructionsSolanaSwapParams {
  authority: string
  inputMint: string
  outputMint: string
  inAmount: number
  outAmount: number
}
