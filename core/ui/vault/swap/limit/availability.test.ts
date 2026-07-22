import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  advancedSwapQueueMimirKey,
  fetchAdvancedSwapQueueEnabled,
  parseAdvancedSwapQueueMimir,
} from './availability'

describe('parseAdvancedSwapQueueMimir', () => {
  it.each(['1', ' 1 ', '1\n'])('enables on a bare 1 (%j)', raw => {
    expect(parseAdvancedSwapQueueMimir(raw)).toBe(true)
  })

  // Fails closed on anything else: a `=<` order placed while the queue is off can
  // execute as an unprotected market swap, so an over-broad accept set here is
  // worse than a rare false block.
  it.each(['0', '2', '-1', '"1"', '01', '+1', '1.0', '', 'true', 'null'])(
    'stays disabled for %j',
    raw => {
      expect(parseAdvancedSwapQueueMimir(raw)).toBe(false)
    }
  )
})

describe('fetchAdvancedSwapQueueEnabled', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const stubFetch = (response: () => Promise<Response>) => {
    const fetchMock = vi.fn(async (_url: RequestInfo | URL) => response())
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
  }

  it('reads the EnableAdvSwapQueue mimir key', async () => {
    const fetchMock = stubFetch(async () => new Response('1'))

    await fetchAdvancedSwapQueueEnabled()

    expect(String(fetchMock.mock.calls[0][0])).toContain(
      `/mimir/key/${advancedSwapQueueMimirKey}`
    )
  })

  it('enables when the node confirms the queue is live', async () => {
    stubFetch(async () => new Response('1'))

    await expect(fetchAdvancedSwapQueueEnabled()).resolves.toBe(true)
  })

  it('disables when the node reports the queue off', async () => {
    stubFetch(async () => new Response('0'))

    await expect(fetchAdvancedSwapQueueEnabled()).resolves.toBe(false)
  })

  it('fails closed when the request throws', async () => {
    stubFetch(async () => {
      throw new Error('network down')
    })

    await expect(fetchAdvancedSwapQueueEnabled()).resolves.toBe(false)
  })

  it('fails closed on an HTTP error', async () => {
    stubFetch(async () => new Response('upstream exploded', { status: 500 }))

    await expect(fetchAdvancedSwapQueueEnabled()).resolves.toBe(false)
  })
})
