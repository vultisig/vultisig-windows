import { MpcLib } from '@core/mpc/mpcLib'

import { getValueProviderSetup } from '../../lib/ui/state/getValueProviderSetup'

export const { useValue: useMpcLib, provider: MpcLibProvider } =
  getValueProviderSetup<MpcLib>('MpcLib')
