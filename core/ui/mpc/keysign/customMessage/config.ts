import { Chain, EvmChain, OtherChain } from '@core/chain/Chain'

export const SigningType = {
  EIP191: 'EIP191', // EVM-style message signing (keccak over bytes)
  RAW_BYTES: 'RAW_BYTES', // Solana: sign bytes as-is (ed25519)
} as const

export type SigningType = (typeof SigningType)[keyof typeof SigningType]

export type CustomMessageSupportedChain =
  | (typeof EvmChain)[keyof typeof EvmChain]
  | typeof OtherChain.Solana

export const chainSigningType: Record<
  CustomMessageSupportedChain,
  SigningType
> = {
  [EvmChain.Ethereum]: SigningType.EIP191,
  [EvmChain.Arbitrum]: SigningType.EIP191,
  [EvmChain.Base]: SigningType.EIP191,
  [EvmChain.Blast]: SigningType.EIP191,
  [EvmChain.Optimism]: SigningType.EIP191,
  [EvmChain.Polygon]: SigningType.EIP191,
  [EvmChain.Avalanche]: SigningType.EIP191,
  [EvmChain.CronosChain]: SigningType.EIP191,
  [EvmChain.BSC]: SigningType.EIP191,
  [EvmChain.Zksync]: SigningType.EIP191,

  [OtherChain.Solana]: SigningType.RAW_BYTES,
}

export const customMessageDefaultChain = Chain.Ethereum
