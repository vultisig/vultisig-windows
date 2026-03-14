import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ReferralHeaderButton } from '../steps/ReferralHeaderButton'
import { ReferralModal } from '../steps/ReferralModal'
import { fastVaultSetupSteps } from '../steps/vault-setup-steps'
import { VaultNameStep } from '../steps/VaultNameStep'
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
      {/* DEV: show name step, skip email/password with defaults */}
      <VaultNameStep
        onFinish={nameData =>
          onFinish({ ...nameData, email: 'C@G', password: 'p' })
        }
        onBack={onBack}
        steps={fastVaultSetupSteps}
        stepIndex={0}
        headerRight={headerRight}
      />
    </>
  )
}
