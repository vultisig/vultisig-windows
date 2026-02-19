import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
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
    <StyledButton onClick={onClick}>
      <HStack alignItems="center" gap={4}>
        {hasReferral && <CheckIcon />}
        <Text size={14} color="primary" weight={500}>
          {t('add_referral')}
        </Text>
      </HStack>
    </StyledButton>
  )
}

const StyledButton = styled(UnstyledButton)`
  cursor: pointer;
`

const CheckIcon = styled(CircleCheckIcon)`
  font-size: 14px;
  color: ${getColor('success')};
`
