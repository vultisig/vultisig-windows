import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack } from '@lib/ui/layout/Stack'
import { panel } from '@lib/ui/panel/Panel'
import { IsActiveProp, OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor, matchColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled(UnstyledButton)<IsActiveProp>`
  ${panel()};

  position: relative;

  border: 2px solid
    ${matchColor('isActive', { true: 'primary', false: 'transparent' })};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

export const UnmergeExplorerOption = ({
  value: { ticker, balance },
  onClick,
  isActive,
}: ValueProp<{
  ticker: string
  balance: string | number
}> &
  OnClickProp &
  IsActiveProp) => {
  const { t } = useTranslation()

  return (
    <Container isActive={isActive} onClick={onClick}>
      <HStack
        fullWidth
        alignItems="center"
        gap={12}
        justifyContent="space-between"
      >
        <Text color="contrast" size={20} weight="700">
          {ticker}
        </Text>
        <Text size={13} color="shy">
          {t('available')}: {balance}
        </Text>
      </HStack>
    </Container>
  )
}
