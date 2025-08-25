import { Chain } from '@core/chain/Chain'
import { kujiraCoinsOnThorChain } from '@core/chain/chains/cosmos/thor/kujira-merge/kujiraCoinsOnThorChain'
import {
  yieldBearingAssetsIds,
  yieldBearingAssetsReceiptDenoms,
} from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/config'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { makeAccountCoin } from '@core/chain/coin/utils/makeAccountCoin'

import { makeUnmergeSpecificPlaceholderCoin } from '../DepositForm/ActionSpecific/UnmergeSpecific/utils'

export function computeMergeOptions(thorCoins: AccountCoin[]) {
  return thorCoins.filter(c => c.id && c.id in kujiraCoinsOnThorChain)
}

export function computeUnmergeOptions(params: {
  thorCoins: AccountCoin[]
  thorAddress: string
  balances: { symbol: string }[]
}) {
  const { thorCoins, thorAddress, balances } = params

  const kujiraTokens = thorCoins.filter(
    c => c.id && c.id in kujiraCoinsOnThorChain
  )

  const extras = balances
    .map(
      tb =>
        thorCoins.find(
          c => c.ticker.toUpperCase() === tb.symbol.toUpperCase()
        ) ?? makeUnmergeSpecificPlaceholderCoin(tb.symbol, thorAddress)
    )
    .filter(
      (c, i, self) =>
        !kujiraTokens.some(k => k.ticker === c.ticker) &&
        self.findIndex(x => x.ticker === c.ticker) === i
    )

  return [...kujiraTokens, ...extras]
}

export function computeRedeemOptions(params: {
  allCoins: AccountCoin[]
  thorAddress: string
}) {
  const { allCoins, thorAddress } = params
  const byId = new Map(allCoins.map(c => [c.id, c]))
  return yieldBearingAssetsIds.map(asset => {
    const denom = yieldBearingAssetsReceiptDenoms[asset]
    return (
      byId.get(denom) ??
      makeAccountCoin({ chain: Chain.THORChain, id: denom }, thorAddress)
    )
  })
}

export function computeMintOptions(params: {
  thorCoins: AccountCoin[]
  thorAddress: string
}) {
  const { thorCoins, thorAddress } = params
  const tcy =
    thorCoins.find(c => c.id === 'tcy') ??
    makeAccountCoin({ chain: Chain.THORChain, id: 'tcy' }, thorAddress)

  return [{ ...chainFeeCoin.THORChain, address: thorAddress }, tcy]
}
