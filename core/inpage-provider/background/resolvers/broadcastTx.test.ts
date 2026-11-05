import { BroadcastError } from '@core/ui/mpc/keysign/broadcastKeysignTx'
import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { broadcastTx } from './broadcastTx'

const broadcastChainTxMock = vi.hoisted(() => vi.fn())

vi.mock('@vultisig/core-chain/tx/broadcast', async importOriginal => ({
  ...(await importOriginal<
    typeof import('@vultisig/core-chain/tx/broadcast')
  >()),
  broadcastTx: (...args: unknown[]) => broadcastChainTxMock(...args),
}))

// Four bytes that are not a transaction — the chain can only reject them.
const notATx = Buffer.from([1, 2, 3, 4]).toString('base64')
const notATxHash =
  '9F64A747E1B97F131FABB6B447296C9B6F0201E79FB3C5356E6C77E89B6A806A'

const sendTx = () =>
  broadcastTx({
    input: { chain: Chain.Terra, txBytes: notATx },
    context: { requestOrigin: 'https://example.com' },
  })

describe('broadcastTx', () => {
  beforeEach(() => {
    broadcastChainTxMock.mockReset()
  })

  it('returns the hash once the chain accepted the tx', async () => {
    broadcastChainTxMock.mockResolvedValue({
      status: 'accepted',
      finality: 'pending',
    })

    await expect(sendTx()).resolves.toEqual({ txHash: notATxHash })
  })

  it('rejects with the chain reason when the chain refused the tx', async () => {
    broadcastChainTxMock.mockResolvedValue({
      status: 'failed',
      code: 'BROADCAST_REJECTED',
      retryable: false,
      cause: new Error(
        'Broadcasting transaction failed with code 2 (codespace: sdk). Log: tx parse error'
      ),
    })

    const error = await sendTx().catch(thrown => thrown)

    expect(error).toBeInstanceOf(BroadcastError)
    expect(error.message).toContain('tx parse error')
  })

  it('still returns the hash when a transport failure left the outcome unknown', async () => {
    broadcastChainTxMock.mockResolvedValue({
      status: 'failed',
      code: 'BROADCAST_TRANSPORT_ERROR',
      retryable: true,
      cause: new Error('fetch failed'),
    })

    await expect(sendTx()).resolves.toEqual({ txHash: notATxHash })
  })
})
