import { describe, expect, it, vi } from 'vitest'

const broadcastTxMock = vi.hoisted(() => vi.fn())

vi.mock('@vultisig/core-chain/tx/broadcast', () => ({
  broadcastTx: (...args: unknown[]) => broadcastTxMock(...args),
}))

import { BroadcastError, broadcastKeysignTx } from './broadcastKeysignTx'

const input = { chain: 'Ton', tx: { encoded: 'boc' } } as never

describe('broadcastKeysignTx', () => {
  it('resolves when the network accepted the transaction', async () => {
    broadcastTxMock.mockResolvedValue({
      status: 'accepted',
      finality: 'pending',
      txHash: 'hash',
    })

    await expect(broadcastKeysignTx(input)).resolves.toBeUndefined()
  })

  it('turns a failed broadcast result into a BroadcastError carrying the on-chain cause', async () => {
    const cause = new Error(
      'inbound external message rejected by transaction: exitcode=133'
    )
    broadcastTxMock.mockResolvedValue({
      status: 'failed',
      code: 'BROADCAST_REJECTED',
      retryable: false,
      cause,
    })

    const error = await broadcastKeysignTx(input).catch(e => e)

    expect(error).toBeInstanceOf(BroadcastError)
    expect(error.cause).toBe(cause)
    expect(error.message).toContain('exitcode=133')
  })

  it('still wraps a resolver that throws', async () => {
    broadcastTxMock.mockRejectedValue(new Error('resolver bug'))

    await expect(broadcastKeysignTx(input)).rejects.toBeInstanceOf(
      BroadcastError
    )
  })
})
