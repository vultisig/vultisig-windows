import { Button } from '@lib/ui/buttons/Button'
import { ArrowWallDownIcon } from '@lib/ui/icons/ArrowWallDownIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PlusSmallIcon } from '@lib/ui/icons/PlusSmallIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const TransactionActions = () => {
  const { t } = useTranslation()

  return (
    <HStack>
      <StyledButton
        icon={
          <ButtonIconWrapper>
            <PlusSmallIcon />
          </ButtonIconWrapper>
        }
      >
        {t('circle.deposit')}
      </StyledButton>
      <WithdrawButton
        kind="secondary"
        icon={
          <ButtonIconWrapper>
            <ArrowWallDownIcon />
          </ButtonIconWrapper>
        }
      >
        {t('circle.withdraw')}
      </WithdrawButton>
    </HStack>
  )
}

const StyledButton = styled(Button)`
  justify-content: flex-start;
  padding: 6px 22px 6px 4px;
`

const WithdrawButton = styled(StyledButton)`
  border-radius: 30px;
  border: 1px solid ${getColor('buttonPrimary')};
`

const ButtonIconWrapper = styled(IconWrapper)`
  width: 34px;
  height: 34px;
  border-radius: 40px;
  background: rgba(255, 255, 255, 0.12);
`
