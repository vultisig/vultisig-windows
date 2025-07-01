import { getCoinFromCoinKey } from '@core/chain/coin/Coin'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'

import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoins } from '../../../../state/currentVaultCoins'
import { useRujiBalanceQuery } from '../../../hooks/useRujiBalanceQuery'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { InputFieldWrapper } from '../../DepositForm.styled'

export const UnmergeSpecific = () => {
  const [{ register }] = useDepositFormHandlers()
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coin = getCoinFromCoinKey(coinKey)
  const coinAddress = useCurrentVaultCoins().find(
    coin => coin.id === coin.id
  )?.address
  const { data: { shares: rujiBalance } = {} } =
    useRujiBalanceQuery(coinAddress)

  return (
    <VStack gap={12}>
      <InputContainer>
        <Text size={15} weight="400">
          Amount {coin && `(Balance: ${rujiBalance} RUJI`}
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
          type="number"
          required
          {...register('amount')}
        />
      </InputContainer>
    </VStack>
  )
}
