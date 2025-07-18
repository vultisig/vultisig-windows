import { TxSecurityValidationResult } from '@core/chain/tx/security/validate'
import { TransactionSecurityWarningModal } from '@core/ui/security/components/TransactionSecurityWarningModal'
import { useBlockaidScanResult } from '@core/ui/security/hooks/useBlockaidScanResult'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Milliseconds } from '@lib/utils/time'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { VaultSecurityType } from '../../../vault/VaultSecurityType'
import { StartKeysignPromptProps } from './StartKeysignPromptProps'

const clickDurationThreshold: Milliseconds = 300
const registerPressDelay: Milliseconds = 200
const requiredPressDuration: Milliseconds = 1600

const Container = styled(Button)`
  position: relative;
  overflow: hidden;
`

const Fill = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  pointer-events: none;
  background: ${getColor('mistExtra')};
  width: 0%;
  animation: fillProgress ${requiredPressDuration - registerPressDelay}ms linear
    ${registerPressDelay}ms forwards;

  @keyframes fillProgress {
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  }
`

export const FastVaultStartKeysignPrompt = ({
  isDisabled,
  keysignPayload,
  ...coreViewState
}: StartKeysignPromptProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { scanTransaction } = useBlockaidScanResult()
  const [startPressingAt, setStartPressingAt] = useState<null | number>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [securityError, setSecurityError] =
    useState<TxSecurityValidationResult | null>(null)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [pendingSecurityType, setPendingSecurityType] =
    useState<VaultSecurityType | null>(null)

  const executeNavigation = useCallback(
    async (securityType: VaultSecurityType) => {
      if (isDisabled || isScanning) return

      setIsScanning(true)
      setSecurityError(null)

      const { error, scanUnavailable } = await scanTransaction(keysignPayload)

      if (error) {
        setSecurityError(error)
        setShowWarningModal(true)
        setPendingSecurityType(securityType)
        return
      }

      navigate({
        id: 'keysign',
        state: {
          securityType,
          keysignPayload,
          scanUnavailable,
          ...coreViewState,
        },
      })
    },
    [
      isDisabled,
      isScanning,
      scanTransaction,
      keysignPayload,
      navigate,
      coreViewState,
    ]
  )

  const handleContinueWithRisk = useCallback(() => {
    if (!pendingSecurityType) return

    setShowWarningModal(false)
    setSecurityError(null)

    navigate({
      id: 'keysign',
      state: {
        securityType: pendingSecurityType,
        keysignPayload,
        ...coreViewState,
      },
    })
    setPendingSecurityType(null)
  }, [navigate, keysignPayload, coreViewState, pendingSecurityType])

  const handleCancel = useCallback(() => {
    setShowWarningModal(false)
    setSecurityError(null)
    setPendingSecurityType(null)
  }, [])

  useEffect(() => {
    if (!startPressingAt) return

    const interval = setTimeout(() => {
      executeNavigation('secure')
    }, requiredPressDuration)

    return () => clearTimeout(interval)
  }, [executeNavigation, startPressingAt])

  return (
    <>
      <VStack gap={12}>
        <Text
          size={14}
          color="shy"
          style={{ textAlign: 'center', width: '100%' }}
        >
          {t('hold_for_paired_sign')}
        </Text>
        <Container
          disabled={isDisabled || isScanning}
          onPointerDown={() => {
            if (isDisabled || isScanning) return

            setStartPressingAt(Date.now())
          }}
          onPointerUp={() => {
            if (isDisabled || isScanning) return

            if (!startPressingAt) return

            const durationSincePress = Date.now() - startPressingAt

            if (durationSincePress < clickDurationThreshold) {
              executeNavigation('fast')
            } else {
              setStartPressingAt(null)
            }
          }}
          onPointerLeave={() => {
            setStartPressingAt(null)
          }}
        >
          {isScanning ? t('signing_transaction') : t('fast_sign')}
          {startPressingAt && <Fill />}
        </Container>
      </VStack>

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
