import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [DklsInboundSequenceNoProvider, useDklsInboundSequenceNoState] =
  setupStateProvider<number>('DklsInboundSequenceNo')
