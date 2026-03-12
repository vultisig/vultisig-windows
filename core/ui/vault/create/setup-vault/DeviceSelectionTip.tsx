import { LightbulbIcon } from '@lib/ui/icons/LightbulbIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledLightbulbIcon = styled(LightbulbIcon)`
  color: ${getColor('info')};
  font-size: 12px;
`

export const DeviceSelectionTip = () => {
  const { t } = useTranslation()

  return (
    <HStack alignItems="center" gap={8}>
      <StyledLightbulbIcon />
      <Text size={12} color="shyExtra">
        {t('seedPhraseImportTip')}
      </Text>
    </HStack>
  )
}
