import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export const [TxHashProvider, useTxHash] = setupValueProvider<string>('TxHash')
