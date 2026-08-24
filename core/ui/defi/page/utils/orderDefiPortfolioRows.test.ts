import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { DefiChainPortfolio } from '../hooks/useDefiPortfolios'
import {
  DefiPortfolioRow,
  orderDefiPortfolioRows,
} from './orderDefiPortfolioRows'

type ChainRowInput = {
  chain: Chain
  totalFiat: number
}

const chainRow = ({ chain, totalFiat }: ChainRowInput): DefiPortfolioRow => ({
  kind: 'chain',
  portfolio: {
    chain,
    totalFiat,
    positionsWithBalanceCount: 1,
    isLoading: false,
  } satisfies DefiChainPortfolio,
})

const names = (rows: DefiPortfolioRow[]) =>
  rows.map(row => (row.kind === 'chain' ? row.portfolio.chain : 'Circle'))

describe('orderDefiPortfolioRows', () => {
  it('orders chains by fiat descending', () => {
    const rows = orderDefiPortfolioRows([
      chainRow({ chain: Chain.TerraClassic, totalFiat: 4.24 }),
      chainRow({ chain: Chain.Tron, totalFiat: 1.75 }),
      chainRow({ chain: Chain.Solana, totalFiat: 11.03 }),
    ])

    expect(names(rows)).toEqual([Chain.Solana, Chain.TerraClassic, Chain.Tron])
  })

  it('keeps a zero-balance Circle below funded chains', () => {
    const rows = orderDefiPortfolioRows([
      { kind: 'circle', totalFiat: 0 },
      chainRow({ chain: Chain.Solana, totalFiat: 11.03 }),
      chainRow({ chain: Chain.Tron, totalFiat: 1.75 }),
    ])

    expect(names(rows)).toEqual([Chain.Solana, Chain.Tron, 'Circle'])
  })

  it('ranks a funded Circle among the chains by its fiat', () => {
    const rows = orderDefiPortfolioRows([
      chainRow({ chain: Chain.Solana, totalFiat: 11.03 }),
      { kind: 'circle', totalFiat: 5 },
      chainRow({ chain: Chain.Tron, totalFiat: 1.75 }),
    ])

    expect(names(rows)).toEqual([Chain.Solana, 'Circle', Chain.Tron])
  })

  it('breaks fiat ties by display name so equal rows stay stable', () => {
    const rows = orderDefiPortfolioRows([
      chainRow({ chain: Chain.Tron, totalFiat: 0 }),
      chainRow({ chain: Chain.Solana, totalFiat: 0 }),
      { kind: 'circle', totalFiat: 0 },
      chainRow({ chain: Chain.THORChain, totalFiat: 0 }),
    ])

    expect(names(rows)).toEqual([
      'Circle',
      Chain.Solana,
      Chain.THORChain,
      Chain.Tron,
    ])
  })

  it('does not mutate the input', () => {
    const input: DefiPortfolioRow[] = [
      chainRow({ chain: Chain.Tron, totalFiat: 1 }),
      chainRow({ chain: Chain.Solana, totalFiat: 9 }),
    ]

    orderDefiPortfolioRows(input)

    expect(names(input)).toEqual([Chain.Tron, Chain.Solana])
  })
})
