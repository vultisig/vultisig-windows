import { Chain } from '@core/chain/Chain'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const {
  useValue: useKeyImportChains,
  provider: KeyImportChainsProvider,
} = getValueProviderSetup<string[]>('KeyImportChains')

export const parseKeyImportChains = (chains: string[]): Chain[] =>
  chains.filter((chain): chain is Chain => chain.length > 0) as Chain[]
