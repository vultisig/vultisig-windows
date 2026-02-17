import { Chain } from '@core/chain/Chain'
import { setupOptionalValueProvider } from '@lib/ui/state/setupOptionalValueProvider'

export const [KeyImportChainsProvider, useKeyImportChains] =
  setupOptionalValueProvider<string[]>()

export const parseKeyImportChains = (chains: string[]): Chain[] =>
  chains.filter((chain): chain is Chain => chain.length > 0) as Chain[]
