import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { textInputBackground, textInputFrame } from '@lib/ui/css/textInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { hStack } from '@lib/ui/layout/Stack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'

const Container = styled.div`
  ${textInputFrame};
  ${textInputBackground};
  ${text({
    color: 'supporting',
    weight: 600,
    size: 16,
  })}
  ${hStack({
    alignItems: 'center',
  })}
`

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
    <InputContainer as="div">
      <InputLabel>Amount (in {fiatCurrency})</InputLabel>
      <Container>
        {sendAmount && (
          <MatchQuery
            value={priceQuery}
            success={price => formatAmount(price * sendAmount, fiatCurrency)}
            pending={() => t('loading')}
            error={() => t('failed_to_load')}
          />
        )}
      </Container>
    </InputContainer>
  )
}
