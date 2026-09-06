import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

import { TxStatusTracker } from './TxStatusTracker'

const { query } = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock('../../../chain/tx/status/useTxStatusQuery', () => ({
  useTxStatusQuery: query,
}))
vi.mock('./TransactionStatusAnimation', () => ({
  TransactionStatusAnimation: () => null,
}))

// The tracker wraps the animation so a failed transaction can print why it
// failed underneath it; the animation is the first child.
const render = () => {
  const wrapper = TxStatusTracker({ chain: Chain.Tron, hash: 'hash' })
  const [animation, failure] = wrapper.props.children

  return { animation, failure }
}

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

    expect(render().animation.props.status).toBe(expected)
  })

  it('keeps the broadcast state until the first status resolves', () => {
    query.mockReturnValue({ data: undefined, isPending: true })

    expect(render().animation.props.status).toBe('broadcasted')
  })

  it('prints the reason under a failed transaction, and nothing when there is none', () => {
    query.mockReturnValue({
      data: {
        status: 'error',
        failure: { reason: 'expired', message: 'sdk text' },
      },
      isPending: false,
    })

    expect(render().failure).not.toBeNull()

    query.mockReturnValue({ data: { status: 'error' }, isPending: false })

    expect(render().failure).toBeNull()
  })
})
