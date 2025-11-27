import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { convertDuration } from '@lib/utils/time/convertDuration'

import { FastVaultPasswordModal } from './FastVaultPasswordModal'
import { usePasswordVerification } from './hooks/usePasswordVerification'

type FastVaultPasswordVerificationProps = Partial<OnBackProp> &
  Partial<
    OnFinishProp<{
      password: string
    }>
  > & { showModal?: boolean }

const verificationTimeoutMs = convertDuration(15, 'd', 'ms')

export const FastVaultPasswordVerification: React.FC<
  FastVaultPasswordVerificationProps
> = () => {
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
