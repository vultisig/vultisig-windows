import { ScanResponse } from '@core/config/security/blockaid/types'
import { Button } from '@lib/ui/buttons/Button'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  visible: boolean
  scan: ScanResponse | null | undefined
  onClose: () => void
  onContinue: () => void
}

export const SecurityWarningModal: FC<Props> = ({
  visible,
  scan,
  onClose,
  onContinue,
}) => {
  const { t } = useTranslation()
  if (!visible || !scan) return null

  const title = t('warning')

  return (
    <Modal onClose={onClose} title={title} placement="center" width={360}>
      <VStack gap={16} alignItems="center">
        <TriangleAlertIcon color="alertError" fontSize={32} />
        <Text size={15} weight={500} centerHorizontally>
          {scan.validation?.reason ?? t('malicious_address_detected')}
        </Text>
        <HStack gap={12} justifyContent="center">
          <Button color="secondary" onClick={onClose} size="md">
            {t('cancel')}
          </Button>
          <Button color="primary" onClick={onContinue} size="md">
            {t('continue_anyway')}
          </Button>
        </HStack>
      </VStack>
    </Modal>
  )
}
