import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export const [IsTssBatchingProvider, useIsTssBatching] =
  setupValueProvider<boolean>('IsTssBatching')
