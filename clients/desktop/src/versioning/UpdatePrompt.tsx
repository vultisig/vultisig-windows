import { useAppNavigate } from '@clients/desktop/src/navigation/hooks/useAppNavigate'
import { isUpdateAvailable } from '@clients/desktop/src/versioning/core/isUpdateAvailable'
import { useLatestVersionQuery } from '@clients/desktop/src/versioning/queries/latestVersion'
import { ProductLogo } from '@core/ui/product/ProductLogo'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const UpdatePrompt = () => {
  const { t } = useTranslation()
  const { version: localVersion } = useCore()
  const latestVersionQuery = useLatestVersionQuery()
  const [isDismissed, setIsDismissed] = useState(false)
  const navigate = useAppNavigate()

  if (isDismissed) return null

  return (
    <MatchQuery
      value={latestVersionQuery}
      success={latestVersion =>
        isUpdateAvailable({ current: localVersion, latest: latestVersion }) ? (
          <Modal
            title=""
            onClose={() => setIsDismissed(true)}
            footer={
              <Button onClick={() => navigate({ id: 'checkUpdate' })}>
                {t('updatePopup.updateButton')}
              </Button>
            }
          >
            <VStack alignItems="center" gap={24}>
              <ProductLogo fontSize={200} />
              <Text size={14} color="contrast" weight={500} centerHorizontally>
                {t('updatePopup.updateAvailableMessage', {
                  latestVersion,
                  localVersion,
                })}
              </Text>
            </VStack>
          </Modal>
        ) : null
      }
    />
  )
}
