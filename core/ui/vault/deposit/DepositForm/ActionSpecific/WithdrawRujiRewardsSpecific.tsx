import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { Text } from '@lib/ui/text'

import { useDepositBalance } from '../../hooks/useDepositBalance'
import { InputFieldWrapper } from '../DepositForm.styled'

export const WithdrawRujiRewardsSpecific = () => {
  const { balanceFormatted } = useDepositBalance({
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
