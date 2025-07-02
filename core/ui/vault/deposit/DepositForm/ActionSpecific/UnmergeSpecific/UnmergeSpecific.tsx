import { getCoinFromCoinKey } from '@core/chain/coin/Coin'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../../../state/currentVaultCoins'
import { useRujiBalanceQuery } from '../../../hooks/useRujiBalanceQuery'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { InputFieldWrapper } from '../../DepositForm.styled'

export const UnmergeSpecific = () => {
  const { t } = useTranslation()
  const [{ register }] = useDepositFormHandlers()
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coin = shouldBePresent(getCoinFromCoinKey(coinKey))
  const coinAddress = shouldBePresent(useCurrentVaultCoin(coinKey)?.address)
  const { data: { shares: rujiBalance } = {} } =
    useRujiBalanceQuery(coinAddress)

  return (
    <VStack gap={12}>
      <InputContainer>
        <Text size={15} weight="400">
          {t('amount')}{' '}
          {coin &&
            rujiBalance !== undefined &&
            `(${t('balance')}: ${rujiBalance} RUJI)`}{' '}
          <Text as="span" color="danger" size={14}>
            *{' '}
          </Text>{' '}
        </Text>

        <InputFieldWrapper
          as="input"
          onWheel={e => e.currentTarget.blur()}
          step="0.0001"
          min={0}
          max={rujiBalance}
          type="number"
          required
          {...register('amount')}
        />
      </InputContainer>
    </VStack>
  )
}
