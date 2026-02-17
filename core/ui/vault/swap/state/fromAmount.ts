import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [FromAmountProvider, useFromAmount] = setupStateProvider<
  bigint | null
>('FromAmount')
