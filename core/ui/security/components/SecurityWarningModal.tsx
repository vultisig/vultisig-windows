import { BlockaidErrorTypes } from '@core/config/security/blockaid/constants'
import { BlockaidError } from '@core/config/security/blockaid/types'
import { Button } from '@lib/ui/buttons/Button'
import { Modal } from '@lib/ui/modal'

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
  const isWarning = error.type === BlockaidErrorTypes.Warning

  return (
    <Modal
      title={isWarning ? 'Security Warning' : 'Security Alert'}
      onClose={onCancel}
    >
      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {isWarning
              ? 'This transaction has been flagged as potentially risky by our security scanner.'
              : 'This transaction has been flagged as malicious by our security scanner.'}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button kind="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            status={isWarning ? 'warning' : 'danger'}
            onClick={onContinue}
          >
            {isWarning ? 'Continue Anyway' : 'Proceed at Own Risk'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
