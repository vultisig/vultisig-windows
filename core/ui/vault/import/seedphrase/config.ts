import { Chain } from '@vultisig/core-chain/Chain'

export const seedphraseWordCounts = [12, 24] as const

export const seedphraseImportSupportedChains = Object.values(Chain).filter(
  chain => chain !== Chain.Cardano
)
