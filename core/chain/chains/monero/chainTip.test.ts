import { afterEach, describe, expect, it, vi } from 'vitest'

import { getMoneroChainTip } from './chainTip'

describe('getMoneroChainTip', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to the next daemon when the first one fails', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { height: 3629305 } }),
      } as Response)

    await expect(getMoneroChainTip()).resolves.toBe(3629305)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
