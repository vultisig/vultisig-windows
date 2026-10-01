import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { ReactNode } from 'react'

import { BondChurn } from '../../../queries/bondRewards/churns'
import { BondChain } from '../../../queries/bondRewards/config'
import { useBondLastRewardQuery } from '../../../queries/bondRewards/useBondLastRewardQuery'
import { noBondRewardValue } from './config'

type BondLastRewardAmountProps = {
  chain: BondChain
  coin: Coin
  nodeAddress: string
  churn: BondChurn
}

/**
 * What the latest churn paid the vault on a bonded node. Shows a dash when
 * the vault had not bonded by then or the read failed, rather than a made-up
 * zero.
 */
export const BondLastRewardAmount = ({
  chain,
  coin,
  nodeAddress,
  churn,
}: BondLastRewardAmountProps) => {
  const query = useBondLastRewardQuery({ chain, nodeAddress, churn })

  const renderValue = (value: ReactNode) => (
    <Text size={14} weight="600" color="shyExtra">
      {value}
    </Text>
  )

  return (
    <MatchQuery
      value={query}
      pending={() => <Skeleton width="64px" height="17px" />}
      error={() => renderValue(noBondRewardValue)}
      success={amount =>
        renderValue(
          amount === null ? (
            noBondRewardValue
          ) : (
            <BalanceVisibilityAware>
              {formatAmount(fromChainAmount(amount, coin.decimals), {
                ticker: coin.ticker,
              })}
            </BalanceVisibilityAware>
          )
        )
      }
    />
  )
}
