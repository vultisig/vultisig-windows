import { Coin } from '@core/chain/coin/Coin'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'

import { useDepositBalance } from '../../hooks/useDepositBalance'
import { InputFieldWrapper } from '../DepositForm.styled'

export const WithdrawRujiRewardsSpecific = ({ value }: ValueProp<Coin>) => {
  const { balanceFormatted } = useDepositBalance({
    selectedCoin: value,
    chain: value.chain,
    selectedChainAction: 'withdraw_ruji_rewards',
  })
  return (
    <InputContainer>
      <Text size={15} weight="400">
        Withdrawable Balance
      </Text>
      <InputFieldWrapper>
        <Text size={15} weight="400">
          {balanceFormatted}
        </Text>
      </InputFieldWrapper>
    </InputContainer>
  )
}
