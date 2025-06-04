import { useVersionCheck } from '@clients/desktop/src/lib/hooks/useVersionCheck'
import { useAppNavigate } from '@clients/desktop/src/navigation/hooks/useAppNavigate'
import { ProductLogo } from '@core/ui/product/ProductLogo'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const UpdateAvailablePopup = () => {
  const { t } = useTranslation()
  const { version: localVersion } = useCore()
  const { latestVersion, updateAvailable, remoteError, isLoading } =
    useVersionCheck()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useAppNavigate()

  useEffect(() => {
    if (!isLoading && !remoteError && updateAvailable) {
      setIsOpen(true)
    }
  }, [isLoading, remoteError, updateAvailable])

  return isOpen ? (
    <Modal
      title=""
      onClose={() => setIsOpen(false)}
      placement="center"
      width={368}
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
