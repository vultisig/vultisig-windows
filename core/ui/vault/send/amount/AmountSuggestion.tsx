import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { toPercents } from '@lib/utils/toPercents'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled(UnstyledButton)<{
  isActive?: boolean
}>`
  width: 56px;
  height: 30px;
  ${borderRadius.s};
  ${centerContent};
  background-color: ${({ isActive }) =>
    isActive ? getColor('buttonPrimary') : getColor('foreground')};
`

export const AmountSuggestion: FC<
  ValueProp<number> &
    Partial<OnClickProp> & {
      isActive?: boolean
      className?: string
    }
> = ({ value, onClick, isActive, className }) => {
  const formattedValue = toPercents(value)
  const { t } = useTranslation()

  return (
    <Container
      className={className}
      isActive={isActive}
      onClick={onClick ? () => onClick() : undefined}
    >
      <Text size={14} weight="500">
        {value === 1 ? t('max') : formattedValue}
      </Text>
    </Container>
  )
}
