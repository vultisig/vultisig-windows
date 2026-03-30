import { setupOptionalValueProvider } from '@lib/ui/state/setupOptionalValueProvider'
import { Chain } from '@vultisig/core-chain/Chain'

export const [KeyImportChainsProvider, useKeyImportChains] =
  setupOptionalValueProvider<string[]>()

export const parseKeyImportChains = (chains: string[]): Chain[] =>
  chains.filter((chain): chain is Chain => chain.length > 0) as Chain[]
