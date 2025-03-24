import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery'
import {
  textInputBackground,
  textInputFrame,
} from '../../../lib/ui/css/textInput'
import { InputContainer } from '../../../lib/ui/inputs/InputContainer'
import { InputLabel } from '../../../lib/ui/inputs/InputLabel'
import { hStack } from '../../../lib/ui/layout/Stack'
import { text } from '../../../lib/ui/text'
import { useFiatCurrency } from '../../../preferences/state/fiatCurrency'
import { useCurrentVaultCoin } from '../../state/currentVault'
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
  const [coinKey] = useCurrentSendCoin()
  const coin = useCurrentVaultCoin(coinKey)
  const [fiatCurrency] = useFiatCurrency()

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
