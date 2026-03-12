import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [MnemonicProvider, useMnemonic] =
  setupStateProvider<string>('Mnemonic')
