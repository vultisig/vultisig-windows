import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { bruneBondConfig } from '@vultisig/core-chain/chains/cosmos/thor/brune-bond/config'
import { fetchNavPerShare } from '@vultisig/core-chain/chains/cosmos/thor/yield-bearing-tokens/services/fetchNavPerShare'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { thorchainTokens } from '../../tokens'
import { ThorchainStakePosition } from '../../types'
import { parseBigint } from '../../utils/parsers'

type FetchBruneStakePositionInput = {
  address: string
  prices: Record<string, number>
}

/**
 * bRUNE staked position (the ybRUNE receipt from Rujira liquid bonding). Reads
 * the on-chain `x/staking-x/brune` receipt balance the same way sTCY reads its
 * receipt.
 *
 * Unlike sTCY, ybRUNE has no direct price feed, so it is valued against bRUNE
 * via the receipt's NAV: `fiat = receiptShares × nav_per_share × bRUNE price`.
 * `nav_per_share` (~1.03) comes from the staking contract's `{"status":{}}`
 * smart query (`fetchNavPerShare`); it falls back to 1 when unavailable, so the
 * position still shows an approximate spot value rather than disappearing.
 */
export const fetchBruneStakePosition = async ({
  address,
  prices,
}: FetchBruneStakePositionInput): Promise<ThorchainStakePosition | null> => {
  try {
    const denom = encodeURIComponent(bruneBondConfig.shareDenom)
    const balance = await queryUrl<{ balance?: { amount?: string } }>(
      `${cosmosRpcUrl.THORChain}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${denom}`
    )
    const amount = parseBigint(balance?.balance?.amount)

    const brunePrice = prices[coinKeyToString(thorchainTokens.brune)] ?? 0
    const navPerShare = (await fetchNavPerShare(bruneBondConfig.contract)) ?? 1
    const fiatValue =
      fromChainAmount(amount, bruneBondConfig.shareDecimals) *
      navPerShare *
      brunePrice

    return {
      id: 'thor-stake-brune',
      ticker: thorchainTokens.ybrune.ticker,
      amount,
      type: 'stake',
      canUnstake: amount > 0n,
      fiatValue,
      estimatedReward: 0,
    }
  } catch {
    return null
  }
}
