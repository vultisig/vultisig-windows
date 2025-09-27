import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

import { useKeysignUtxoInfo } from '../../../mpc/keysign/utxo/queries/keysignUtxoInfo'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositChainSpecificQuery } from '../queries/useDepositChainSpecificQuery'

export const DepositFeeValue = ({ amount }: { amount: bigint }) => {
  const [coin] = useDepositCoin()
  const query = useDepositChainSpecificQuery(coin)
  const { t } = useTranslation()
  const { data: utxoInfo } = useKeysignUtxoInfo({
    chain: coin.chain,
    address: coin.address,
  })

  return (
    <MatchQuery
      value={query}
      pending={() => <Spinner />}
      error={() => t('failed_to_load')}
      success={chainSpecific =>
        formatFee({
          chain: coin.chain,
          amount: getFeeAmount({
            chainSpecific,
            utxoInfo,
            amount,
            chain: coin.chain,
          }),
        })
      }
    />
  )
}
