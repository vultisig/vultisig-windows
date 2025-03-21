import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup'

export type SwapSide = 'from' | 'to'

export const { useValue: useSide, provider: SideProvider } =
  getValueProviderSetup<SwapSide>('SideProvider')
