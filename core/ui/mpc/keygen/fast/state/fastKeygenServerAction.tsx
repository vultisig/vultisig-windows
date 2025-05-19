import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const {
  useValue: useFastKeygenServerAction,
  provider: FastKeygenServerActionProvider,
} = getValueProviderSetup<() => Promise<void>>('FastKeygenServerAction')
