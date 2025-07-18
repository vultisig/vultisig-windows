import { txSecurityProviderName } from '@core/chain/tx/security/config'
import { TxSecurityValidationResult } from '@core/chain/tx/security/validate'
import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

type TransactionSecurityWarningModalProps = {
  error: TxSecurityValidationResult
  isVisible: boolean
  onContinue: () => void
  onCancel: () => void
}

export const TransactionSecurityWarningModal = ({
  error,
  isVisible,
  onContinue,
  onCancel,
}: TransactionSecurityWarningModalProps) => {
  const { t } = useTranslation()

  if (!isVisible) return null

  return (
    <Modal
      title={match(error, {
        malicious: () => t('security_alert_malicious_transaction'),
        warning: () => t('security_warning_transaction'),
      })}
      onClose={onCancel}
    >
      <div className="p-6">
        <VStack gap={16} style={{ alignItems: 'center' }}>
          <VStack gap={8} style={{ alignItems: 'center' }}>
            <Text size={14} color="shy" style={{ textAlign: 'center' }}>
              {t('tx_security_error_message', {
                provider: txSecurityProviderName,
              })}
            </Text>
          </VStack>
        </VStack>

        <VStack gap={12} style={{ marginTop: '16px' }}>
          <Match
            value={error}
            malicious={() => (
              <Text size={14} color="danger" style={{ textAlign: 'center' }}>
                {t('malicious_transaction_warning')}
              </Text>
            )}
            warning={() => (
              <Text size={14} color="warning" style={{ textAlign: 'center' }}>
                {t('suspicious_transaction_warning')}
              </Text>
            )}
          />
        </VStack>

        <VStack gap={12} style={{ marginTop: '24px' }}>
          <Button kind="primary" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Text
            size={12}
            color="shy"
            style={{ textAlign: 'center', cursor: 'pointer' }}
            onClick={onContinue}
          >
            {match(error, {
              malicious: () => t('proceed_at_own_risk'),
              warning: () => t('continue_with_risk'),
            })}
          </Text>
        </VStack>
      </div>
    </Modal>
  )
}
