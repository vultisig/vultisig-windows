import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { Chain } from '@vultisig/core-chain/Chain'

export type KeyImportInput = {
  mnemonic: string
  chains: Chain[]
  usePhantomSolanaPath?: boolean
}

export const [KeyImportInputProvider, useKeyImportInput] =
  setupValueProvider<KeyImportInput>('KeyImportInput')
