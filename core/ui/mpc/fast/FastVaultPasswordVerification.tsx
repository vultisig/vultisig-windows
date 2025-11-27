import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { convertDuration } from '@lib/utils/time/convertDuration'

import { FastVaultPasswordModal } from './FastVaultPasswordModal'
import { usePasswordVerification } from './hooks/usePasswordVerification'

const verificationTimeoutMs = convertDuration(15, 'd', 'ms')

export const FastVaultPasswordVerification = () => {
  const vault = useCurrentVault()
  const { lastPasswordVerificationTime } = vault
  const now = Date.now()

  const shouldShowModal =
    !lastPasswordVerificationTime ||
    now - lastPasswordVerificationTime > verificationTimeoutMs

  const { verifyPassword, error, isPending } = usePasswordVerification()

  const handleBack = () => {
    verifyPassword(undefined)
  }

  const handleFinish = ({ password }: { password: string }) => {
    verifyPassword(password)
  }

  if (!shouldShowModal) return null

  return (
    <FastVaultPasswordModal
      showModal={shouldShowModal}
      onBack={handleBack}
      onFinish={handleFinish}
      error={error}
      isPending={isPending}
    />
  )
}
