import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { rujiStakeApiUrl } from '../../constants'
import { fetchRujiStakePosition } from './rujiStakeService'

vi.mock('@vultisig/lib-utils/query/queryUrl', () => ({
  queryUrl: vi.fn(),
}))

type AprStatus = 'AVAILABLE' | 'NOT_APPLICABLE' | 'SOON'

type StakeEntry = {
  bonded?: {
    amount?: string
    asset?: { metadata?: { symbol?: string } }
  }
  liquidSize?: { amount?: string }
  pendingRevenue?: { amount?: string }
  pool?: {
    summary?: {
      apr?: { value?: string | null; status?: AprStatus | null }
    }
  }
}

const rujiStake = ({
  apr = { value: '37176753737', status: 'AVAILABLE' },
  bondedAmount = '100',
  liquidSizeAmount = '300',
  symbol = 'RUJI',
}: {
  apr?: { value?: string | null; status?: AprStatus | null }
  bondedAmount?: string
  liquidSizeAmount?: string
  symbol?: string
} = {}): StakeEntry => ({
  bonded: {
    amount: bondedAmount,
    asset: { metadata: { symbol } },
  },
  liquidSize: { amount: liquidSizeAmount },
  pendingRevenue: { amount: '0' },
  pool: { summary: { apr } },
})

const mockQueries = ({
  entries = [rujiStake()],
  receiptAmount = '200',
  receiptFailure = false,
}: {
  entries?: StakeEntry[]
  receiptAmount?: string
  receiptFailure?: boolean
} = {}) => {
  vi.mocked(queryUrl).mockImplementation(url => {
    if (url === rujiStakeApiUrl) {
      return Promise.resolve({
        data: { node: { stakingV2: entries } },
      })
    }

    if (receiptFailure) {
      return Promise.reject(new Error('THORChain RPC unavailable'))
    }

    return Promise.resolve({ balance: { amount: receiptAmount } })
  })
}

const fetchPosition = () =>
  fetchRujiStakePosition({ address: 'thor1test', prices: {} })

describe('fetchRujiStakePosition', () => {
  beforeEach(() => {
    vi.mocked(queryUrl).mockReset()
  })

  it('parses APR only when the API marks it available', async () => {
    mockQueries()

    const position = await fetchPosition()

    expect(position?.apr).toBeCloseTo(3.7176753737)
  })

  it.each([
    ['SOON', { value: '37176753737', status: 'SOON' }],
    ['NOT_APPLICABLE', { value: '37176753737', status: 'NOT_APPLICABLE' }],
    ['null status', { value: '37176753737', status: null }],
    ['missing status', { value: '37176753737' }],
  ] as const)('does not surface APR for %s', async (_label, apr) => {
    mockQueries({ entries: [rujiStake({ apr })] })

    const position = await fetchPosition()

    expect(position?.apr).toBeUndefined()
  })

  it.each([
    ['null value', { value: null, status: 'AVAILABLE' }],
    ['missing value', { status: 'AVAILABLE' }],
  ] as const)('does not surface APR for %s', async (_label, apr) => {
    mockQueries({ entries: [rujiStake({ apr })] })

    const position = await fetchPosition()

    expect(position?.apr).toBeUndefined()
  })

  it('preserves an explicitly available zero APR', async () => {
    mockQueries({
      entries: [rujiStake({ apr: { value: '0', status: 'AVAILABLE' } })],
    })

    const position = await fetchPosition()

    expect(position?.apr).toBe(0)
  })

  it('selects the RUJI pool instead of the first staking entry', async () => {
    mockQueries({
      entries: [
        rujiStake({
          apr: { value: '990000000000', status: 'AVAILABLE' },
          symbol: 'OTHER',
        }),
        rujiStake(),
      ],
    })

    const position = await fetchPosition()

    expect(position?.apr).toBeCloseTo(3.7176753737)
  })

  it('prefers the API liquid size over receipt and bonded amounts', async () => {
    mockQueries({
      entries: [rujiStake({ bondedAmount: '100', liquidSizeAmount: '300' })],
      receiptAmount: '200',
    })

    const position = await fetchPosition()

    expect(position?.amount).toBe(300n)
  })

  it('uses the receipt balance when the API has no liquid size', async () => {
    mockQueries({
      entries: [rujiStake({ bondedAmount: '100', liquidSizeAmount: '0' })],
      receiptAmount: '200',
    })

    const position = await fetchPosition()

    expect(position?.amount).toBe(200n)
  })

  it('falls back to the bonded amount when the receipt lookup fails', async () => {
    mockQueries({
      entries: [rujiStake({ bondedAmount: '100', liquidSizeAmount: '0' })],
      receiptFailure: true,
    })

    const position = await fetchPosition()

    expect(position?.amount).toBe(100n)
  })
})
