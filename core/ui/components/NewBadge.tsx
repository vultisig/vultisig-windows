import { WandSparklesIcon } from '@lib/ui/icons/WandSparklesIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled.div`
  ${hStack({
    alignItems: 'center',
    gap: 4,
  })}
  color: ${getColor('idle')};
`

const BadgeText = styled(Text)`
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.12px;
  text-transform: uppercase;
`

const BadgeIcon = styled(WandSparklesIcon)`
  font-size: 12px;
`

export const NewBadge = () => {
  const { t } = useTranslation()

  return (
    <Container>
      <BadgeIcon />
      <BadgeText>{t('new')}</BadgeText>
    </Container>
  )
}
