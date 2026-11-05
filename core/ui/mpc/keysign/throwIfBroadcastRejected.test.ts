import { describe, expect, it } from 'vitest'

import { BroadcastError } from './broadcastKeysignTx'
import { throwIfBroadcastRejected } from './throwIfBroadcastRejected'

describe('throwIfBroadcastRejected', () => {
  it('passes an accepted broadcast through', () => {
    expect(() =>
      throwIfBroadcastRejected({
        status: 'accepted',
        finality: 'pending',
        txHash: 'hash',
      })
    ).not.toThrow()
  })

  it('throws the chain reason when the broadcast was rejected', () => {
    const cause = new Error(
      'Broadcasting transaction failed with code 13 (codespace: sdk). Log: insufficient fees'
    )

    const error = (() => {
      try {
        throwIfBroadcastRejected({
          status: 'failed',
          code: 'BROADCAST_REJECTED',
          retryable: false,
          cause,
        })
      } catch (thrown) {
        return thrown
      }
    })()

    expect(error).toBeInstanceOf(BroadcastError)
    expect(error).toHaveProperty('cause', cause)
    expect(error).toHaveProperty(
      'message',
      expect.stringContaining('insufficient fees')
    )
  })

  it('does not throw on a transport failure, where the tx may have landed', () => {
    expect(() =>
      throwIfBroadcastRejected({
        status: 'failed',
        code: 'BROADCAST_TRANSPORT_ERROR',
        retryable: true,
        cause: new Error('fetch failed'),
      })
    ).not.toThrow()
  })
})
