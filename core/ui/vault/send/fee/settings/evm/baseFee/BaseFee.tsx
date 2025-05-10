import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { EvmChain } from '@core/chain/Chain'
import { gwei } from '@core/chain/tx/fee/evm/gwei'
import { useEvmBaseFeeQuery } from '@core/ui/chain/queries/evm/useEvmBaseFeeQuery'
import { FeeContainer } from '@core/ui/vault/send/fee/settings/FeeContainer'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'

export const BaseFee = () => {
  const { t } = useTranslation()

  const [{ coin: coinKey }] = useCurrentSendCoin()

  const query = useEvmBaseFeeQuery(coinKey.chain as EvmChain)

  return (
    <InputContainer>
      <InputLabel>
        {t('current_base_fee')} ({t('gwei')})
      </InputLabel>
      <FeeContainer>
        <MatchQuery
          value={query}
          success={data =>
            formatTokenAmount(fromChainAmount(data, gwei.decimals))
          }
          error={() => null}
          pending={() => <Spinner />}
        />
      </FeeContainer>
    </InputContainer>
  )
}
