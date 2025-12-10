import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { thorchainTokens } from '../../tokens'
import { ThorchainStakePosition } from '../../types'
import { parseBigint } from '../../utils/parsers'

type FetchStcyStakePositionInput = {
  address: string
  prices: Record<string, number>
}

export const fetchStcyStakePosition = async ({
  address,
  prices,
}: FetchStcyStakePositionInput): Promise<ThorchainStakePosition | null> => {
  try {
    const denom = encodeURIComponent(tcyAutoCompounderConfig.shareDenom)
    const balance = await queryUrl<{ balance?: { amount?: string } }>(
      `${cosmosRpcUrl.THORChain}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${denom}`
    )
    const amount = parseBigint(balance?.balance?.amount)
    const price = prices[coinKeyToString(thorchainTokens.stcy)] ?? 0
    const fiatValue = getCoinValue({
      amount,
      decimals: thorchainTokens.stcy.decimals,
      price,
    })

    return {
      id: 'thor-stake-stcy',
      ticker: thorchainTokens.stcy.ticker,
      amount,
      fiatValue,
      estimatedReward: 0,
    }
  } catch {
    return null
  }
}
