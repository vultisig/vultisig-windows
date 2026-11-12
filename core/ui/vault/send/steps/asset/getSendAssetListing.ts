import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'

import { getChainDisplayName } from '../../../../chain/metadata/getChainDisplayName'

/** The chain whose coins the asset list shows; `null` shows every chain. */
export type SendChainFilter = Chain | null

type GetSendAssetListingInput = {
  /** The vault's portfolio coins, in vault order. */
  coins: readonly AccountCoin[]
  /** The vault's chains, in vault order. */
  chains: readonly Chain[]
  getFiatValue: (coin: AccountCoin) => number
  filter: SendChainFilter
  query: string
  /** Listed even when `coins` leaves it out, as a DeFi-only coin a DeFi tab opened Send with. */
  selectedCoin: AccountCoin
}

type SendAssetListing = {
  coins: AccountCoin[]
  /** The selected coin is on screen, so continuing with it is what the user sees. */
  isSelectedCoinListed: boolean
}

type MatchesQueryInput = {
  coin: AccountCoin
  query: string
}

const matchesQuery = ({ coin, query }: MatchesQueryInput) =>
  coin.ticker.toLowerCase().includes(query) ||
  getChainDisplayName(coin.chain).toLowerCase().includes(query)

const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

/**
 * The send asset list. A non-empty query searches every chain and ignores the
 * filter. Coins sort by fiat value, then ticker, then chain, with the selected
 * coin pinned first when the filter and search keep it, even if `coins` leaves
 * it out.
 */
export const getSendAssetListing = ({
  coins,
  chains,
  getFiatValue,
  filter,
  query,
  selectedCoin,
}: GetSendAssetListingInput): SendAssetListing => {
  const normalizedQuery = query.trim().toLowerCase()
  const chainIndex = new Map(chains.map((chain, index) => [chain, index]))
  const candidates = coins.some(coin => areEqualCoins(coin, selectedCoin))
    ? coins
    : [selectedCoin, ...coins]

  const rows = candidates.flatMap(coin => {
    const index = chainIndex.get(coin.chain)
    if (index === undefined) return []

    const isListed = normalizedQuery
      ? matchesQuery({ coin, query: normalizedQuery })
      : filter === null || coin.chain === filter

    return isListed
      ? [{ coin, fiat: getFiatValue(coin), chainIndex: index }]
      : []
  })

  rows.sort(
    (a, b) =>
      b.fiat - a.fiat ||
      compareText(a.coin.ticker, b.coin.ticker) ||
      a.chainIndex - b.chainIndex
  )

  const selectedIndex = rows.findIndex(({ coin }) =>
    areEqualCoins(coin, selectedCoin)
  )
  if (selectedIndex > 0) {
    rows.unshift(...rows.splice(selectedIndex, 1))
  }

  return {
    coins: rows.map(({ coin }) => coin),
    isSelectedCoinListed: selectedIndex >= 0,
  }
}

type FilterChainsByQueryInput = {
  chains: readonly Chain[]
  query: string
}

/**
 * The chains whose display name or native ticker contains `query`, ignoring
 * case, in the order given. An empty query keeps every chain.
 */
export const filterChainsByQuery = ({
  chains,
  query,
}: FilterChainsByQueryInput) => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return [...chains]

  return chains.filter(
    chain =>
      getChainDisplayName(chain).toLowerCase().includes(normalizedQuery) ||
      chainFeeCoin[chain].ticker.toLowerCase().includes(normalizedQuery)
  )
}
