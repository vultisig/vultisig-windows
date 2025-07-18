import { TxSecurityValidationResult } from '@core/chain/tx/security/validate'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { TransactionSecurityWarningModal } from '@core/ui/security/components/TransactionSecurityWarningModal'
import { useBlockaidScanResult } from '@core/ui/security/hooks/useBlockaidScanResult'
import { Button } from '@lib/ui/buttons/Button'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { StartKeysignPromptProps } from './StartKeysignPromptProps'

export const SecureVaultStartKeysignPrompt = ({
  isDisabled,
  keysignPayload,
  ...coreViewState
}: StartKeysignPromptProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { scanTransaction } = useBlockaidScanResult()
  const [isScanning, setIsScanning] = useState(false)
  const [securityError, setSecurityError] =
    useState<TxSecurityValidationResult | null>(null)
  const [showWarningModal, setShowWarningModal] = useState(false)

  const handleSignTransaction = useCallback(async () => {
    if (isDisabled) return

    setIsScanning(true)
    setSecurityError(null)

    const { error, scanUnavailable } = await scanTransaction(keysignPayload)

    if (error) {
      setSecurityError(error)
      setShowWarningModal(true)
      return
    }

    navigate({
      id: 'keysign',
      state: {
        securityType: 'secure',
        keysignPayload,
        scanUnavailable,
        ...coreViewState,
      },
    })
  }, [isDisabled, scanTransaction, keysignPayload, navigate, coreViewState])

  const handleContinueWithRisk = useCallback(() => {
    setShowWarningModal(false)
    setSecurityError(null)

    navigate({
      id: 'keysign',
      state: {
        securityType: 'secure',
        keysignPayload,
        ...coreViewState,
      },
    })
  }, [navigate, keysignPayload, coreViewState])

  const handleCancel = useCallback(() => {
    setShowWarningModal(false)
    setSecurityError(null)
  }, [])

  return (
    <>
      <Button
        disabled={isDisabled || isScanning}
        onClick={handleSignTransaction}
      >
        {isScanning ? t('signing_transaction') : t('sign_transaction')}
      </Button>

      {securityError && (
        <TransactionSecurityWarningModal
          error={securityError}
          isVisible={showWarningModal}
          onContinue={handleContinueWithRisk}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}
