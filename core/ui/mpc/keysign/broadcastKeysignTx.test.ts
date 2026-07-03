import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { describe, expect, it } from 'vitest'

import { BroadcastError } from './broadcastKeysignTx'

describe('BroadcastError', () => {
  it('preserves the underlying RPC message', () => {
    const cause = new Error('Blockhash not found')
    const error = new BroadcastError(cause)

    expect(error).toBeInstanceOf(BroadcastError)
    expect(error.cause).toBe(cause)
    expect(extractErrorMsg(error)).toBe('Blockhash not found')
  })

  it('hoists Solana SendTransactionError program logs into the message', () => {
    const cause = Object.assign(
      new Error('Transaction simulation failed: custom program error: 0x1'),
      {
        logs: [
          'Program 11111111111111111111111111111111 invoke [1]',
          'Program 11111111111111111111111111111111 failed: insufficient lamports',
        ],
      }
    )

    const message = extractErrorMsg(new BroadcastError(cause))

    expect(message).toContain('Transaction simulation failed')
    expect(message).toContain('insufficient lamports')
  })

  it('hoists JSON-RPC data.logs into the message', () => {
    const cause = {
      message: 'failed to send transaction',
      data: { logs: ['Program log: error: already in use'] },
    }

    const message = extractErrorMsg(new BroadcastError(cause))

    expect(message).toContain('failed to send transaction')
    expect(message).toContain('already in use')
  })

  it('does not duplicate logs already present in the message', () => {
    const log = 'Program log: insufficient funds'
    const cause = Object.assign(new Error(`simulation failed: ${log}`), {
      logs: [log],
    })

    const message = extractErrorMsg(new BroadcastError(cause))

    expect(message.split(log)).toHaveLength(2)
  })
})
