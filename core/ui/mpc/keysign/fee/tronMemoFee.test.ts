import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it, vi } from 'vitest'

import {
  addTronMemoFee,
  fetchTronMemoFee,
  paysTronMemoFee,
} from './tronMemoFee'

describe('fetchTronMemoFee', () => {
  it('reads getMemoFee from the chain parameters', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          chainParameter: [{ key: 'getMemoFee', value: 2_000_000 }],
        }),
        { status: 200 }
      )
    )

    await expect(fetchTronMemoFee(fetcher)).resolves.toBe(2_000_000n)
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringMatching(/\/wallet\/getchainparameters$/),
      expect.objectContaining({ method: 'POST', body: '{}' })
    )
  })

  it.each([
    ['an RPC failure', vi.fn<typeof fetch>().mockRejectedValue(new Error())],
    [
      'a failed response',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 500 })),
    ],
    [
      'a missing parameter',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(JSON.stringify({ chainParameter: [] }), { status: 200 })
        ),
    ],
    [
      'a malformed parameter',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            chainParameter: [{ key: 'getMemoFee', value: -1 }],
          }),
          { status: 200 }
        )
      ),
    ],
  ])('falls back to 1 TRX for %s', async (_, fetcher) => {
    await expect(fetchTronMemoFee(fetcher)).resolves.toBe(1_000_000n)
  })

  it('aborts a stalled request and falls back to 1 TRX', async () => {
    vi.useFakeTimers()

    try {
      let requestSignal: AbortSignal | undefined
      const fetcher = vi.fn<typeof fetch>().mockImplementation((_, init) => {
        requestSignal = init?.signal ?? undefined

        return new Promise<Response>((_, reject) => {
          requestSignal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true }
          )
        })
      })

      const result = fetchTronMemoFee(fetcher)
      await vi.advanceTimersByTimeAsync(10_000)

      await expect(result).resolves.toBe(1_000_000n)
      expect(requestSignal?.aborted).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('paysTronMemoFee', () => {
  const nativeTron = {
    chain: Chain.Tron,
    isNativeToken: true,
  }

  it.each(['memo', ' ', 'freeze:bandwidth', 'FREEZE:', 'FREEZE:CPU'])(
    'charges a signed memo: %s',
    memo => {
      expect(paysTronMemoFee({ ...nativeTron, memo })).toBe(true)
    }
  )

  it.each([
    'FREEZE:BANDWIDTH',
    'FREEZE:ENERGY',
    'UNFREEZE:BANDWIDTH',
    'UNFREEZE:ENERGY',
  ])('does not charge the unsigned staking marker: %s', memo => {
    expect(paysTronMemoFee({ ...nativeTron, memo })).toBe(false)
  })

  it('does not charge an empty memo, another chain, or a TRC20 transfer', () => {
    expect(paysTronMemoFee({ ...nativeTron, memo: '' })).toBe(false)
    expect(
      paysTronMemoFee({
        chain: Chain.Ethereum,
        isNativeToken: true,
        memo: 'memo',
      })
    ).toBe(false)
    expect(
      paysTronMemoFee({
        chain: Chain.Tron,
        isNativeToken: false,
        memo: 'memo',
      })
    ).toBe(false)
  })
})

describe('addTronMemoFee', () => {
  it('adds the chain memo fee to the existing bandwidth estimate', async () => {
    await expect(
      addTronMemoFee({
        fee: 800_000n,
        chain: Chain.Tron,
        isNativeToken: true,
        memo: 'memo',
        memoFee: async () => 1_000_000n,
      })
    ).resolves.toBe(1_800_000n)
  })

  it('does not request the memo fee when no signed memo is present', async () => {
    const memoFee = vi.fn(async () => 1_000_000n)

    await expect(
      addTronMemoFee({
        fee: 800_000n,
        chain: Chain.Tron,
        isNativeToken: true,
        memo: '',
        memoFee,
      })
    ).resolves.toBe(800_000n)
    expect(memoFee).not.toHaveBeenCalled()
  })
})
