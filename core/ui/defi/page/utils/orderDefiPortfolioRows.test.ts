import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { DefiChainPortfolio } from '../hooks/useDefiPortfolios'
import {
  DefiPortfolioRow,
  orderDefiPortfolioRows,
} from './orderDefiPortfolioRows'

const chainRow = (chain: Chain, totalFiat: number): DefiPortfolioRow => ({
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
      chainRow(Chain.TerraClassic, 4.24),
      chainRow(Chain.Tron, 1.75),
      chainRow(Chain.Solana, 11.03),
    ])

    expect(names(rows)).toEqual([Chain.Solana, Chain.TerraClassic, Chain.Tron])
  })

  it('keeps a zero-balance Circle below funded chains', () => {
    const rows = orderDefiPortfolioRows([
      { kind: 'circle', totalFiat: 0 },
      chainRow(Chain.Solana, 11.03),
      chainRow(Chain.Tron, 1.75),
    ])

    expect(names(rows)).toEqual([Chain.Solana, Chain.Tron, 'Circle'])
  })

  it('ranks a funded Circle among the chains by its fiat', () => {
    const rows = orderDefiPortfolioRows([
      chainRow(Chain.Solana, 11.03),
      { kind: 'circle', totalFiat: 5 },
      chainRow(Chain.Tron, 1.75),
    ])

    expect(names(rows)).toEqual([Chain.Solana, 'Circle', Chain.Tron])
  })

  it('breaks fiat ties by display name so equal rows stay stable', () => {
    const rows = orderDefiPortfolioRows([
      chainRow(Chain.Tron, 0),
      chainRow(Chain.Solana, 0),
      { kind: 'circle', totalFiat: 0 },
      chainRow(Chain.THORChain, 0),
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
      chainRow(Chain.Tron, 1),
      chainRow(Chain.Solana, 9),
    ]

    orderDefiPortfolioRows(input)

    expect(names(input)).toEqual([Chain.Tron, Chain.Solana])
  })
})
