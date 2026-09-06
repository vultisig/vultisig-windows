import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TxStatusTracker } from './TxStatusTracker'

const { query } = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock('../../../chain/tx/status/useTxStatusQuery', () => ({
  useTxStatusQuery: query,
}))
vi.mock('./TransactionStatusAnimation', () => ({
  TransactionStatusAnimation: () => null,
}))

describe('TxStatusTracker SDK status compatibility', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each([
    ['expired', 'error'],
    ['error', 'error'],
    ['not_found', 'pending'],
    ['pending', 'pending'],
    ['success', 'success'],
  ])('renders %s as %s', (status, expected) => {
    query.mockReturnValue({ data: { status }, isPending: false })
    const element = TxStatusTracker({ chain: Chain.Tron, hash: 'hash' })
    expect(element.props.status).toBe(expected)
  })

  it('keeps the broadcast state until the first status resolves', () => {
    query.mockReturnValue({ data: undefined, isPending: true })
    expect(
      TxStatusTracker({ chain: Chain.Tron, hash: 'hash' }).props.status
    ).toBe('broadcasted')
  })
})
