import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { KeygenNetworkReminder } from './KeygenNetworkReminder'

const Circle = styled.div`
  ${round};
  background: ${getColor('primary')};
  ${sameDimensions(134)};
  ${centerContent};
  font-size: 44px;
  color: ${getColor('contrast')};
`

export const KeygenSuccessState = () => {
  const { t } = useTranslation()

  return (
    <PageContent>
      <VStack flexGrow alignItems="center" justifyContent="center" gap={20}>
        <Circle>
          <CheckIcon />
        </Circle>
        <Text color="contrast" weight={700} size={20}>
          {t('done')}
        </Text>
      </VStack>
      <KeygenNetworkReminder />
    </PageContent>
  )
}
