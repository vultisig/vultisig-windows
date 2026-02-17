import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export const [FastKeygenServerActionProvider, useFastKeygenServerAction] =
  setupValueProvider<() => Promise<void>>('FastKeygenServerAction')
