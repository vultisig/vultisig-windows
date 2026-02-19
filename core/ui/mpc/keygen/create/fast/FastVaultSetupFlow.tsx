import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ReferralHeaderButton } from '../steps/ReferralHeaderButton'
import { ReferralModal } from '../steps/ReferralModal'
import { VaultEmailStep } from '../steps/VaultEmailStep'
import { VaultNameStep } from '../steps/VaultNameStep'
import { VaultPasswordStep } from '../steps/VaultPasswordStep'
import { FastVaultCreationInput } from '../VaultCreationInput'

type FastVaultSetupFlowProps = OnFinishProp<FastVaultCreationInput> &
  Partial<OnBackProp>

export const FastVaultSetupFlow = ({
  onFinish,
  onBack,
}: FastVaultSetupFlowProps) => {
  const { t } = useTranslation()
  const [referralCode, setReferralCode] = useState('')
  const [
    isReferralModalOpen,
    { set: openReferralModal, unset: closeReferralModal },
  ] = useBoolean(false)
  const { addToast } = useToast()

  const handleApplyReferral = () => {
    closeReferralModal()
    addToast({ message: t('fastVaultSetup.referralAdded') })
  }

  const headerRight = (
    <ReferralHeaderButton
      hasReferral={!!referralCode}
      onClick={openReferralModal}
    />
  )

  return (
    <>
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={closeReferralModal}
        referralCode={referralCode}
        onReferralCodeChange={setReferralCode}
        onApply={handleApplyReferral}
      />
      <ValueTransfer<{ name: string }>
        from={({ onFinish }) => (
          <VaultNameStep
            onFinish={onFinish}
            onBack={onBack}
            stepIndex={0}
            headerRight={headerRight}
          />
        )}
        to={({ value: nameData, onBack: goBackToName }) => (
          <ValueTransfer<string>
            from={({ onFinish }) => (
              <VaultEmailStep
                onFinish={onFinish}
                onBack={goBackToName}
                stepIndex={1}
                headerRight={headerRight}
              />
            )}
            to={({ value: email, onBack: goBackToEmail }) => (
              <VaultPasswordStep
                onBack={goBackToEmail}
                stepIndex={2}
                headerRight={headerRight}
                onFinish={({ password }) =>
                  onFinish({
                    ...nameData,
                    referral: referralCode || undefined,
                    email,
                    password,
                    hint: undefined,
                  })
                }
              />
            )}
          />
        )}
      />
    </>
  )
}
