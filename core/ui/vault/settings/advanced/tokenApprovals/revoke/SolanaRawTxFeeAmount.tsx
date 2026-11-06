import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'

import { useSolanaRawTxFeeQuery } from './useSolanaRawTxFeeQuery'

/** The network fee of a raw Solana transaction, in SOL. */
export const SolanaRawTxFeeAmount = ({ value }: ValueProp<string>) => {
  const { t } = useTranslation()
  const { decimals, ticker } = chainFeeCoin[OtherChain.Solana]

  return (
    <MatchQuery
      value={useSolanaRawTxFeeQuery(value)}
      pending={() => t('loading')}
      error={() => t('failed_to_load')}
      success={lamports =>
        formatAmount(fromChainAmount(lamports, decimals), { ticker })
      }
    />
  )
}
