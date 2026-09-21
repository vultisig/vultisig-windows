import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { toPercents } from '@vultisig/lib-utils/toPercents'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

/**
 * Fixed at 56px the four suggestions ask for more of the row than the popup
 * has beside the coin pill, and Max wrapped onto a line of its own. Below the
 * breakpoint they share whatever the row leaves them instead, which keeps them
 * on one line without a width that has to be guessed.
 */
const Container = styled(UnstyledButton)<{
  isActive?: boolean
}>`
  width: 56px;
  height: 30px;

  @media (max-width: 400px) {
    flex: 1 1 0;
    width: auto;
    min-width: 0;
  }
  ${borderRadius.sm};
  ${centerContent};
  background-color: ${({ isActive }) =>
    isActive ? getColor('buttonPrimary') : getColor('foreground')};

  &:disabled {
    color: ${getColor('buttonTextDisabled')};
    cursor: default;
  }
`

/**
 * One of the fraction-of-balance shortcuts (25% … Max) shown under an amount
 * field. `disabled` is for when there is no balance to take a fraction of, so
 * the row does not read as clickable while doing nothing.
 */
export const AmountSuggestion: FC<
  ValueProp<number> &
    Partial<OnClickProp> & {
      isActive?: boolean
      disabled?: boolean
      className?: string
    }
> = ({ value, onClick, isActive, disabled, className }) => {
  const formattedValue = toPercents(value)
  const { t } = useTranslation()

  return (
    <Container
      className={className}
      isActive={isActive}
      disabled={disabled}
      onClick={onClick ? () => onClick() : undefined}
    >
      <Text size={14} weight="500">
        {value === 1 ? t('max') : formattedValue}
      </Text>
    </Container>
  )
}
