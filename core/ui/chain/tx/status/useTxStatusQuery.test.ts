import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { unknownTxHash } from '../unknownTxHash'
import { useTxStatusQuery } from './useTxStatusQuery'

const { query } = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock('@tanstack/react-query', () => ({ useQuery: query }))

describe('useTxStatusQuery polling', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each([
    ['expired', false],
    ['error', false],
    ['success', false],
    ['not_found', 3000],
    ['pending', 3000],
    [undefined, 3000],
  ])('uses the correct polling interval for %s', (status, expected) => {
    useTxStatusQuery({ chain: Chain.Tron, hash: 'hash', senderAccountId: 'T' })
    const options = query.mock.calls[0][0]
    expect(options.refetchInterval({ state: { data: { status } } })).toBe(
      expected
    )
  })

  it.each([
    [unknownTxHash, false],
    ['hash', true],
  ])('runs the query for hash %j: %s', (hash, expected) => {
    useTxStatusQuery({ chain: Chain.Osmosis, hash, senderAccountId: 'osmo' })
    expect(query.mock.calls[0][0].enabled).toBe(expected)
  })
})
