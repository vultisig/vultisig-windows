import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type DoneButtonProps = {
  onClick: () => void
  disabled?: boolean
}

export const DoneButton = ({ onClick, disabled }: DoneButtonProps) => {
  const { t } = useTranslation()

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <Text color="primaryAlt" as="span" size={14} weight={400}>
        {t('done')}
      </Text>
    </StyledButton>
  )
}

const StyledButton = styled(UnstyledButton)`
  display: flex;
  padding: 6px 12px;
  align-items: center;
  gap: 6px;

  border-radius: 99px;
  background: ${getColor('foreground')};

  transition: background 0.3s ease;

  &:hover {
    background: ${getColor('foregroundDark')};
  }
`
