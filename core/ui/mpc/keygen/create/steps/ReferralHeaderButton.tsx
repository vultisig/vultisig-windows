import { Button } from '@lib/ui/buttons/Button'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type ReferralHeaderButtonProps = {
  hasReferral: boolean
  onClick: () => void
}

export const ReferralHeaderButton = ({
  hasReferral,
  onClick,
}: ReferralHeaderButtonProps) => {
  const { t } = useTranslation()

  return (
    <StyledButton size="sm" kind="secondary" onClick={onClick}>
      <HStack alignItems="center" gap={4}>
        {hasReferral && <CheckIcon />}

        {hasReferral ? t('fastVaultSetup.referralAdded') : t('add_referral')}
      </HStack>
    </StyledButton>
  )
}

const StyledButton = styled(Button)`
  cursor: pointer;
`

const CheckIcon = styled(CircleCheckIcon)`
  font-size: 14px;
  color: ${getColor('success')};
`
