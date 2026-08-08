import { HStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const BlockaidSimulationPending = () => {
  const { t } = useTranslation()

  return (
    <Panel>
      <HStack gap={8} alignItems="center" justifyContent="center">
        <Spinner />
        <Text size={15} weight={500} centerHorizontally>
          {t('blockaid_simulation_pending')}
        </Text>
      </HStack>
    </Panel>
  )
}
