import { useVaults } from '@core/ui/storage/vaults'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { PopupDeadEnd } from './PopupDeadEnd'

export const VaultsOnly = ({ children }: ChildrenProp) => {
  const vaults = useVaults()
  const { t } = useTranslation()

  if (vaults.length === 0) {
    return (
      <PopupDeadEnd>
        <VStack alignItems="center" gap={24} justifyContent="center">
          <TriangleAlertIcon fontSize={36} />
          <VStack
            alignItems="center"
            gap={16}
            justifyContent="center"
            fullWidth
          >
            <Text size={17} weight={500} centerHorizontally>
              {t('no_vaults')}
            </Text>
            <Text color="light" size={14} weight={500} centerHorizontally>
              {t('no_vaults_desc')}
            </Text>
          </VStack>
        </VStack>
      </PopupDeadEnd>
    )
  }

  return <>{children}</>
}
