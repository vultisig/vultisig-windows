import { circleName } from '../../protocols/circle/core/config'
import { DefiChainPortfolio } from '../hooks/useDefiPortfolios'

/**
 * A row of the DeFi portfolio list: either an enabled chain's rollup or the
 * Circle yield account, which carries fiat but no chain of its own.
 */
export type DefiPortfolioRow =
  | { kind: 'chain'; portfolio: DefiChainPortfolio }
  | { kind: 'circle'; totalFiat: number }

const getRowFiat = (row: DefiPortfolioRow) =>
  row.kind === 'chain' ? row.portfolio.totalFiat : row.totalFiat

const getRowName = (row: DefiPortfolioRow) =>
  row.kind === 'chain' ? String(row.portfolio.chain) : circleName

/**
 * Orders the DeFi portfolio rows the way the Wallet tab orders chains: by the
 * fiat value each row displays, descending. Circle is ranked by its yield fiat
 * alongside the chains rather than pinned to an end of the list.
 *
 * Ties fall back to the row's display name so rows with equal fiat — notably
 * the many zero-balance chains — keep a stable order across re-renders while
 * per-chain balances are still resolving.
 */
export const orderDefiPortfolioRows = (
  rows: readonly DefiPortfolioRow[]
): DefiPortfolioRow[] =>
  [...rows].sort((a, b) => {
    const fiatDiff = getRowFiat(b) - getRowFiat(a)

    if (fiatDiff !== 0) return fiatDiff

    return getRowName(a).localeCompare(getRowName(b))
  })
