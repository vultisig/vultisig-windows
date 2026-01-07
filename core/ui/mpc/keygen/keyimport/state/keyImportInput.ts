import { Chain } from '@core/chain/Chain'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export type KeyImportInput = {
  mnemonic: string
  chains: Chain[]
}

export const { useValue: useKeyImportInput, provider: KeyImportInputProvider } =
  getValueProviderSetup<KeyImportInput>('KeyImportInput')
