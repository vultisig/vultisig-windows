import { Chain } from '@core/chain/Chain'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export type KeyImportInput = {
  mnemonic: string
  chains: Chain[]
  usePhantomSolanaPath?: boolean
}

export const [KeyImportInputProvider, useKeyImportInput] =
  setupValueProvider<KeyImportInput>('KeyImportInput')
