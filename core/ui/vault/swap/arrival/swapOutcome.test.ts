import { SwapArrivalStatusResult } from '@vultisig/core-chain/swap/utils/getSwapArrivalStatus'
import { TxStatusResult } from '@vultisig/core-chain/tx/status/resolver'
import { describe, expect, it } from 'vitest'

import { getSwapOutcome } from './swapOutcome'

const source = (status: TxStatusResult['status']): TxStatusResult => ({
  status,
})

const arrival = (
  status: SwapArrivalStatusResult['status']
): SwapArrivalStatusResult =>
  ({ provider: 'thorchain', txHash: 'hash', status }) as SwapArrivalStatusResult

describe('getSwapOutcome', () => {
  it('is pending until the source transaction has been read', () => {
    expect(
      getSwapOutcome({
        source: undefined,
        arrival: undefined,
        tracksArrival: true,
      })
    ).toBe('pending')
  })

  it.each(['pending', 'not_found'] as const)(
    'is pending while the source transaction is %s',
    status => {
      expect(
        getSwapOutcome({
          source: source(status),
          arrival: undefined,
          tracksArrival: false,
        })
      ).toBe('pending')
    }
  )

  it.each(['error', 'expired'] as const)(
    'fails when the source transaction is %s, whatever the provider says',
    status => {
      expect(
        getSwapOutcome({
          source: source(status),
          arrival: arrival('success'),
          tracksArrival: true,
        })
      ).toBe('failed')
    }
  )

  it('settles an aggregator swap on its source receipt alone', () => {
    expect(
      getSwapOutcome({
        source: source('success'),
        arrival: undefined,
        tracksArrival: false,
      })
    ).toBe('success')
  })

  // The headline case: a THORChain deposit confirms in seconds, and the
  // refund that follows is only visible to the provider.
  it('keeps a tracked swap pending after its deposit confirms until the provider answers', () => {
    expect(
      getSwapOutcome({
        source: source('success'),
        arrival: undefined,
        tracksArrival: true,
      })
    ).toBe('pending')
    expect(
      getSwapOutcome({
        source: source('success'),
        arrival: arrival('pending'),
        tracksArrival: true,
      })
    ).toBe('pending')
  })

  it.each(['refunded', 'error'] as const)(
    'fails a tracked swap the provider reports as %s after the deposit confirmed',
    status => {
      expect(
        getSwapOutcome({
          source: source('success'),
          arrival: arrival(status),
          tracksArrival: true,
        })
      ).toBe('failed')
    }
  )

  it.each(['success', 'partial'] as const)(
    'succeeds a tracked swap the provider reports as %s',
    status => {
      expect(
        getSwapOutcome({
          source: source('success'),
          arrival: arrival(status),
          tracksArrival: true,
        })
      ).toBe('success')
    }
  )
})
