import { getCoinFromCoinKey } from '@core/chain/coin/Coin'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'
import { useRujiBalanceQuery } from '../../../hooks/useRujiBalanceQuery'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { InputFieldWrapper } from '../../DepositForm.styled'

export const UnmergeSpecific = () => {
  const { t } = useTranslation()
  const [{ setValue, watch }] = useDepositFormHandlers()
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coin = getCoinFromCoinKey(coinKey)
  const { data: rujiBalance } = useRujiBalanceQuery(coinKey.chain)

  return (
    <VStack gap={12}>
      <InputContainer>
        <Text size={15} weight="400">
          Amount {coin && `(Balance: ${rujiBalance} ${coin?.ticker})`}
          <Text as="span" color="danger" size={14}>
            *
          </Text>
        </Text>

        <InputFieldWrapper
          as="input"
          onWheel={e => e.currentTarget.blur()}
          step="0.0001"
          min={0}
          max={rujiBalance}
          required
        />
      </InputContainer>
    </VStack>
  )
}
