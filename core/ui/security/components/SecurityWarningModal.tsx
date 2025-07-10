import { BlockaidErrorTypes } from '@core/config/security/blockaid/constants'
import { BlockaidError } from '@core/config/security/blockaid/types'
import { Button } from '@lib/ui/buttons/Button'
import { Modal } from '@lib/ui/modal'
import { useTranslation } from 'react-i18next'

type SecurityWarningModalProps = {
  error: BlockaidError
  onContinue: () => void
  onCancel: () => void
}

export const SecurityWarningModal = ({
  error,
  onContinue,
  onCancel,
}: SecurityWarningModalProps) => {
  const { t } = useTranslation()
  const isWarning = error.type === BlockaidErrorTypes.Warning

  return (
    <Modal
      title={isWarning ? t('security_warning') : t('security_alert')}
      onClose={onCancel}
    >
      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {isWarning
              ? t('transaction_flagged_risky')
              : t('transaction_flagged_malicious')}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button kind="secondary" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button
            status={isWarning ? 'warning' : 'danger'}
            onClick={onContinue}
          >
            {isWarning ? t('continue_anyway') : t('proceed_at_own_risk')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
