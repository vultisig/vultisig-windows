import { DappRequestRow } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/DappRequestRow'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Panel = styled(VStack)`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  gap: 16px;
  padding: 20px;
`

export const DappRequestHeader = () => {
  const { t } = useTranslation()

  return (
    <Panel>
      <Text color="shy" size={14} weight={500}>
        {t('request_from')}
      </Text>
      <DappRequestRow />
    </Panel>
  )
}
