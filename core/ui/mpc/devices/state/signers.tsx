import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export const [MpcSignersProvider, useMpcSigners] =
  setupValueProvider<string[]>('MpcSigners')
