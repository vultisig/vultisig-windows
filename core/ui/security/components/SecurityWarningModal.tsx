import { BlockaidResultTypes } from '@core/config/security/blockaid/constants'
import { ScanResponse } from '@core/config/security/blockaid/types'
import { Button } from '@lib/ui/buttons/Button'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { VStack } from '@lib/ui/layout/Stack'
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
        <TriangleAlertIcon
          color={
            scan.validation?.result_type === BlockaidResultTypes.Malicious
              ? 'danger'
              : 'idle'
          }
          fontSize={32}
        />
        <Text size={15} weight={500} centerHorizontally>
          {scan.validation?.reason ?? t('malicious_address_detected')}
        </Text>
        <VStack gap={12} alignItems="center">
          <Button color="primary" onClick={onClose} size="md">
            {t('cancel')}
          </Button>
          <Text
            color="shy"
            size={12}
            weight={500}
            style={{ cursor: 'pointer' }}
            onClick={onContinue}
          >
            {t('continue_anyway')}
          </Text>
        </VStack>
      </VStack>
    </Modal>
  )
}
