import { MpcLib } from '@core/mpc/mpcLib'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const {
  useValue: useVaultCreationMpcLib,
  provider: VaultCreationMpcLibProvider,
} = getValueProviderSetup<MpcLib>('VaultCreationMpcLib')
