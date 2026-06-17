import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'

type DefiTokenAmountProps = {
  query: Query<bigint>
  ticker: string
  decimals: number
}

/** Renders a token balance from a Query, falling back to 0 while loading. */
export const DefiTokenAmount = ({
  query,
  ticker,
  decimals,
}: DefiTokenAmountProps) => (
  <MatchQuery
    value={query}
    success={balance =>
      formatAmount(fromChainAmount(balance, decimals), { ticker })
    }
    inactive={() => formatAmount(0, { ticker })}
  />
)
