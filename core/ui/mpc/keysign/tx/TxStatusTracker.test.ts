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
vi.mock('./TxStatusView', () => ({
  TxStatusView: () => null,
}))

// The tracker hands the view a resolved status and, for a failed transaction,
// the reason to print underneath the animation.
const render = () => {
  const { props } = TxStatusTracker({ chain: Chain.Tron, hash: 'hash' })

  return { status: props.status, description: props.description }
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

    expect(render().status).toBe(expected)
  })

  it('keeps the broadcast state until the first status resolves', () => {
    query.mockReturnValue({ data: undefined, isPending: true })

    expect(render().status).toBe('broadcasted')
  })

  it('prints the reason under a failed transaction, and nothing when there is none', () => {
    query.mockReturnValue({
      data: {
        status: 'error',
        failure: { reason: 'expired', message: 'sdk text' },
      },
      isPending: false,
    })

    expect(render().description).toBeDefined()

    query.mockReturnValue({ data: { status: 'error' }, isPending: false })

    expect(render().description).toBeUndefined()
  })
})
