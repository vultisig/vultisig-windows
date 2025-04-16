import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const {
  useValue: useMpcLocalModeAvailability,
  provider: MpcLocalModeAvailabilityProvider,
} = getValueProviderSetup<boolean>('MpcLocalModeAvailability')
