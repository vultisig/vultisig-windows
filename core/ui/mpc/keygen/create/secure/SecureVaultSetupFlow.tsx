import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ReferralHeaderButton } from '../steps/ReferralHeaderButton'
import { ReferralModal } from '../steps/ReferralModal'
import { secureVaultSetupSteps } from '../steps/vault-setup-steps'
import { VaultNameStep } from '../steps/VaultNameStep'
import { SecureVaultCreationInput } from '../VaultCreationInput'

type SecureVaultSetupFlowProps = OnFinishProp<SecureVaultCreationInput> &
  Partial<OnBackProp>

export const SecureVaultSetupFlow = ({
  onFinish,
  onBack,
}: SecureVaultSetupFlowProps) => {
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
      <VaultNameStep
        onFinish={({ name }) =>
          onFinish({ name, referral: referralCode || undefined })
        }
        onBack={onBack}
        steps={secureVaultSetupSteps}
        stepIndex={0}
        headerRight={headerRight}
      />
    </>
  )
}
