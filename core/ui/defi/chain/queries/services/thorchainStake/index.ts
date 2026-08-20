import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { thorchainTokens } from '../../tokens'
import { RawThorchainStakePosition } from '../../types'
import { parseBigint } from '../../utils/parsers'
import { fetchBruneStakePosition } from './bruneStakeService'
import { fetchRujiStakePositions } from './rujiStakeService'
import { fetchStcyStakePosition } from './stcyStakeService'
import { fetchTcyStakePosition } from './tcyStakeService'

const getBalanceByDenom = (address: string, denom: string) =>
  queryUrl<{ balance?: { amount?: string } }>(
    `${cosmosRpcUrl.THORChain}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${encodeURIComponent(denom)}`
  )

type FetchYieldStakePositionInput = {
  address: string
  id: string
  coin: Coin
}

const fetchYieldStakePosition = async ({
  address,
  id,
  coin,
}: FetchYieldStakePositionInput): Promise<RawThorchainStakePosition | null> => {
  try {
    const denom = coin.id ?? coin.ticker
    const balance = await getBalanceByDenom(address, denom)
    const amount = parseBigint(balance?.balance?.amount)

    return {
      id,
      ticker: coin.ticker,
      amount,
      fiatBasis: {
        coinKey: coinKeyToString(coin),
        amount: fromChainAmount(amount, coin.decimals),
      },
      type: 'index',
      canUnstake: amount > 0n,
    }
  } catch {
    return null
  }
}

/**
 * Fetches every THORChain stake position for the address as price-free raw
 * data; fiat values are joined from live prices at render.
 */
export const fetchStakePositions = async (address: string) => {
  const [tcy, stcy, rujiPositions, brune, yRune, yTcy] = await Promise.all([
    fetchTcyStakePosition(address),
    fetchStcyStakePosition(address),
    fetchRujiStakePositions(address),
    fetchBruneStakePosition(address),
    fetchYieldStakePosition({
      address,
      id: 'thor-stake-yrune',
      coin: thorchainTokens.yRune,
    }),
    fetchYieldStakePosition({
      address,
      id: 'thor-stake-ytcy',
      coin: thorchainTokens.yTcy,
    }),
  ])

  const positions = [tcy, stcy, ...rujiPositions, brune, yRune, yTcy].filter(
    (p): p is RawThorchainStakePosition => p !== null
  )
  return { positions }
}
