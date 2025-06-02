import { UnstyledButton } from '@lib/ui/button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getHoverVariant } from '@lib/ui/theme/getHoverVariant'
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
    isActive ? getColor('buttonPrimaryWeb') : getColor('foreground')};

  &:hover {
    background: ${getHoverVariant('foreground')};
  }
`

export const AmountSuggestion: FC<
  ValueProp<number> &
    OnClickProp & {
      isActive?: boolean
    }
> = ({ value, onClick, isActive }) => {
  const formattedValue = toPercents(value)
  const { t } = useTranslation()

  return (
    <Container isActive={isActive} onClick={onClick}>
      <Text>{value === 1 ? t('max') : formattedValue}</Text>
    </Container>
  )
}
