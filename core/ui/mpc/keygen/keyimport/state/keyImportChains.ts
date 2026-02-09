import { Chain } from '@core/chain/Chain'
import { getOptionalValueProviderSetup } from '@lib/ui/state/getOptionalValueProviderSetup'

export const {
  useValue: useKeyImportChains,
  provider: KeyImportChainsProvider,
} = getOptionalValueProviderSetup<string[]>()

export const parseKeyImportChains = (chains: string[]): Chain[] =>
  chains.filter((chain): chain is Chain => chain.length > 0) as Chain[]
