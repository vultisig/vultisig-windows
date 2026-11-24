import { beforeEach, describe, expect, it, vi } from 'vitest'

const queryUrlMock = vi.hoisted(() => vi.fn())

vi.mock('@vultisig/lib-utils/query/queryUrl', () => ({
  queryUrl: (url: string) => queryUrlMock(url),
}))

vi.mock('@vultisig/lib-utils/sleep', () => ({
  sleep: async () => {},
}))

import { findTonGaslessTraceId } from './findTonGaslessTraceId'

// The wallet tx of the gasless send in issue #5318, as toncenter returns it.
const bodyHash =
  '1426cf514e8581a22d01373c2fbc0ffdf219769cbd6d1687f6cfe36b7d7f4973'
const traceIdBase64 = 'rtgAybirTQ9qE5aaU/YHnDLL5Hho0Awfw0B2cjfV7pQ='
const traceIdHex =
  'aed800c9b8ab4d0f6a13969a53f6079c32cbe47868d00c1fc340767237d5ee94'

describe('findTonGaslessTraceId', () => {
  beforeEach(() => {
    queryUrlMock.mockReset()
  })

  it('returns the trace id as hex, looked up by body hash', async () => {
    queryUrlMock.mockResolvedValue({
      transactions: [{ trace_id: traceIdBase64 }],
    })

    await expect(findTonGaslessTraceId(bodyHash)).resolves.toBe(traceIdHex)
    expect(queryUrlMock.mock.calls[0][0]).toContain(`body_hash=${bodyHash}`)
  })

  it('retries until the indexer has the transaction', async () => {
    queryUrlMock
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ transactions: [] })
      .mockResolvedValue({ transactions: [{ trace_id: traceIdBase64 }] })

    await expect(findTonGaslessTraceId(bodyHash)).resolves.toBe(traceIdHex)
    expect(queryUrlMock).toHaveBeenCalledTimes(3)
  })

  it('gives up after a bounded number of attempts', async () => {
    queryUrlMock.mockResolvedValue({ transactions: [] })

    await expect(findTonGaslessTraceId(bodyHash)).resolves.toBeUndefined()
    expect(queryUrlMock).toHaveBeenCalledTimes(5)
  })
})
