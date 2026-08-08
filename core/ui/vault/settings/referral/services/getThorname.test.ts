import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { thorchainNodeBaseUrl } from '../config'
import { checkAvailability } from './getThorname'

vi.mock('@vultisig/lib-utils/query/queryUrl', () => ({
  queryUrl: vi.fn(),
}))

describe('checkAvailability', () => {
  beforeEach(() => {
    vi.mocked(queryUrl).mockReset()
  })

  it('returns false when THORNode finds an existing THORName', async () => {
    vi.mocked(queryUrl).mockResolvedValue({ code: 0 })

    await expect(checkAvailability('vult')).resolves.toBe(false)
    expect(queryUrl).toHaveBeenCalledWith(
      `${thorchainNodeBaseUrl}/thorname/vult`
    )
  })

  it('returns true when THORNode reports a missing THORName', async () => {
    vi.mocked(queryUrl).mockResolvedValue({ code: 1 })

    await expect(checkAvailability('new')).resolves.toBe(true)
  })

  it('rejects query failures instead of reporting the THORName available', async () => {
    const error = new Error('THORNode unavailable')
    vi.mocked(queryUrl).mockRejectedValue(error)

    await expect(checkAvailability('down')).rejects.toThrow(
      'THORNode unavailable'
    )
  })
})
