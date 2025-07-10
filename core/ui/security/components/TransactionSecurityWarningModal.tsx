import { BlockaidError } from '@core/config/security/blockaid/types'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { HStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type TransactionSecurityWarningModalProps = {
  error: BlockaidError
  isVisible: boolean
  onContinue: () => void
  onCancel: () => void
}

const WarningIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-alertWarning);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
`

const DangerIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
`

export const TransactionSecurityWarningModal = ({
  error,
  isVisible,
  onContinue,
  onCancel,
}: TransactionSecurityWarningModalProps) => {
  const { t } = useTranslation()

  const isMalicious = error.type === 'blockaid-malicious'
  const Icon = isMalicious ? DangerIcon : WarningIcon
  const iconText = isMalicious ? '!' : '⚠'

  if (!isVisible) return null

  return (
    <Modal
      title={
        isMalicious
          ? t('security_alert_malicious_transaction')
          : t('security_warning_transaction')
      }
      onClose={onCancel}
    >
      <div className="p-6">
        <VStack gap={16} style={{ alignItems: 'center' }}>
          <Icon>{iconText}</Icon>
          <VStack gap={8} style={{ alignItems: 'center' }}>
            <Text size={14} color="shy" style={{ textAlign: 'center' }}>
              {error.message}
            </Text>
          </VStack>
        </VStack>

        <VStack gap={12} style={{ marginTop: '16px' }}>
          {isMalicious ? (
            <Text size={14} color="danger" style={{ textAlign: 'center' }}>
              {t('malicious_transaction_warning')}
            </Text>
          ) : (
            <Text size={14} color="warning" style={{ textAlign: 'center' }}>
              {t('suspicious_transaction_warning')}
            </Text>
          )}
        </VStack>

        <HStack gap={12} style={{ marginTop: '16px' }}>
          <Button kind="secondary" onClick={onCancel} style={{ flex: 1 }}>
            {t('cancel')}
          </Button>
          <Button
            status={isMalicious ? 'danger' : 'warning'}
            onClick={onContinue}
            style={{ flex: 1 }}
          >
            {isMalicious ? t('proceed_at_own_risk') : t('continue_with_risk')}
          </Button>
        </HStack>
      </div>
    </Modal>
  )
}
