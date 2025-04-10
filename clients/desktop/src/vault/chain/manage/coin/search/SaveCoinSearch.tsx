import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useNavigateBack } from '../../../../../navigation/hooks/useNavigationBack'

const Container = styled(UnstyledButton)`
  ${borderRadius.m};
  background: ${getColor('foreground')};
  color: ${getColor('primaryAlt')};
  height: 100%;
  ${centerContent};
  ${horizontalPadding(20)};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

export const SaveCoinSearch = () => {
  const { t } = useTranslation()
  const goBack = useNavigateBack()

  return <Container onClick={goBack}>{t('save')}</Container>
}
