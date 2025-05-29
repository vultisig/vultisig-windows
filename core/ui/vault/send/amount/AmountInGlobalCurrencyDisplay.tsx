import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'

import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'

export const AmountInGlobalCurrencyDisplay = () => {
  const { t } = useTranslation()
  const [sendAmount] = useSendAmount()
  const [{ coin: coinKey }] = useCurrentSendCoin()
  const coin = useCurrentVaultCoin(coinKey)
  const fiatCurrency = useFiatCurrency()

  const priceQuery = useCoinPriceQuery({
    coin,
  })

  return (
    <Text color="shy" size={14}>
      {sendAmount && (
        <MatchQuery
          value={priceQuery}
          success={price => formatAmount(price * sendAmount, fiatCurrency)}
          pending={() => t('loading')}
          error={() => t('failed_to_load')}
        />
      )}
    </Text>
  )
}
