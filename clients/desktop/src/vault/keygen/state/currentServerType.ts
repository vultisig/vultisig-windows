import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup'
import { KeygenServerType } from '@core/keygen/server/KeygenServerType'

export const {
  useState: useCurrentServerType,
  provider: CurrentServerTypeProvider,
} = getStateProviderSetup<KeygenServerType>('CurrentServerType')
