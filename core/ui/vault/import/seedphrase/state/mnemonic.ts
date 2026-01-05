import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const { useState: useMnemonic, provider: MnemonicProvider } =
  getStateProviderSetup<string>('Mnemonic')
