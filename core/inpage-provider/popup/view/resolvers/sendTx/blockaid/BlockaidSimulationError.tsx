import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const BlockaidSimulationError = () => {
  const { t } = useTranslation()

  return (
    <Panel>
      <VStack gap={12} alignItems="center">
        <TriangleAlertIcon color="warning" fontSize={24} />
        <VStack gap={8} alignItems="center">
          <Text size={15} weight={500} color="warning" centerHorizontally>
            {t('blockaid_simulation_failed')}
          </Text>
          <Text size={13} color="shy" centerHorizontally>
            {t('blockaid_simulation_failed_description')}
          </Text>
        </VStack>
      </VStack>
    </Panel>
  )
}
