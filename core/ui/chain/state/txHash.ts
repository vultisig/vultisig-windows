import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const { useValue: useTxHash, provider: TxHashProvider } =
  getValueProviderSetup<string>('TxHash')
