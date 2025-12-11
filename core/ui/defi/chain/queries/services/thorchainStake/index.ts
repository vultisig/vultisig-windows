import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { Coin } from '@core/chain/coin/Coin'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { thorchainTokens } from '../../tokens'
import { ThorchainStakePosition } from '../../types'
import { parseBigint } from '../../utils/parsers'
import { fetchRujiStakePosition } from './rujiStakeService'
import { fetchStcyStakePosition } from './stcyStakeService'
import { fetchTcyStakePosition } from './tcyStakeService'

const getBalanceByDenom = (address: string, denom: string) =>
  queryUrl<{ balance?: { amount?: string } }>(
    `${cosmosRpcUrl.THORChain}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${encodeURIComponent(denom)}`
  )

type FetchYieldStakePositionInput = {
  address: string
  prices: Record<string, number>
  id: string
  coin: Coin
}

const fetchYieldStakePosition = async ({
  address,
  prices,
  id,
  coin,
}: FetchYieldStakePositionInput): Promise<ThorchainStakePosition | null> => {
  try {
    const denom = coin.id ?? coin.ticker
    const balance = await getBalanceByDenom(address, denom)
    const amount = parseBigint(balance?.balance?.amount)
    const price = prices[coinKeyToString(coin)] ?? 0
    const fiatValue = getCoinValue({
      amount,
      decimals: coin.decimals,
      price,
    })

    return {
      id,
      ticker: coin.ticker,
      amount,
      fiatValue,
      type: 'index',
      canUnstake: amount > 0n,
    }
  } catch {
    return null
  }
}

type FetchStakePositionsInput = {
  address: string
  prices: Record<string, number>
}

export const fetchStakePositions = async ({
  address,
  prices,
}: FetchStakePositionsInput) => {
  const [tcy, stcy, ruji, yRune, yTcy] = await Promise.all([
    fetchTcyStakePosition({ address, prices }),
    fetchStcyStakePosition({ address, prices }),
    fetchRujiStakePosition({ address, prices }),
    fetchYieldStakePosition({
      address,
      prices,
      id: 'thor-stake-yrune',
      coin: thorchainTokens.yRune,
    }),
    fetchYieldStakePosition({
      address,
      prices,
      id: 'thor-stake-ytcy',
      coin: thorchainTokens.yTcy,
    }),
  ])

  const positions = [tcy, stcy, ruji, yRune, yTcy].filter(
    (p): p is ThorchainStakePosition => p !== null
  )
  return { positions }
}
