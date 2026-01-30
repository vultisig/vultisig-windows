import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { convertDuration } from '@lib/utils/time/convertDuration'
import { useTranslation } from 'react-i18next'

import { FastVaultPasswordModal } from './FastVaultPasswordModal'
import { usePasswordVerification } from './hooks/usePasswordVerification'

const verificationTimeoutMs = convertDuration(15, 'd', 'ms')

export const FastVaultPasswordVerification = () => {
  const { t } = useTranslation()
  const { lastPasswordVerificationTime } = useCurrentVault()
  const now = Date.now()

  const shouldShowModal =
    !lastPasswordVerificationTime ||
    now - lastPasswordVerificationTime > verificationTimeoutMs

  const { verifyPassword } = usePasswordVerification()

  const handleBack = () => {
    verifyPassword(undefined)
  }

  const handleFinish = ({ password }: { password: string }) => {
    verifyPassword(password)
  }

  if (!shouldShowModal) return null

  return (
    <FastVaultPasswordModal
      description={t('verify_password_periodic_message_description')}
      onBack={handleBack}
      onFinish={handleFinish}
      showModal={shouldShowModal}
    />
  )
}
