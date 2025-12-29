import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const {
  provider: DklsInboundSequenceNoProvider,
  useState: useDklsInboundSequenceNoState,
} = getStateProviderSetup<number>('DklsInboundSequenceNo')
